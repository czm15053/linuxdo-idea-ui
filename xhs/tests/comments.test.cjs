const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const { test } = require("node:test");

// Test the shipped, unminified IIFE without executing its browser bootstrap.
// Private functions keep their production scope; only their browser boundaries
// are replaced with deterministic fixtures. `pnpm test` rebuilds this artifact.
const source = readFileSync(process.env.XHS_TEST_BUNDLE || resolve(__dirname, "../xhs-im.user.js"), "utf8");
function extract(name, next) {
  const start = source.indexOf(`  function ${name}(`);
  const end = source.indexOf(`\n  ${next}`, start);
  assert(start >= 0 && end > start, `Missing bundle function: ${name}`);
  return source.slice(start, end);
}
const comment = (id) => ({ id, name: id, text: id, handle: id, avatar: "avatar" });

function merge(domIds, stateIds) {
  const context = vm.createContext({
    noteContainer: () => null,
    harvestNoteComments: () => domIds.map(comment),
    harvestCommentsFromState: () => stateIds.map(comment),
  });
  vm.runInContext(extract("collectNoteComments", "function kickCommentScroller"), context);
  return vm.runInContext("collectNoteComments('note').map(c => c.id).join(',')", context);
}

test("late child stays before the next root comment", () => {
  assert.equal(merge(["A", "A1", "A2", "B"], ["A", "A1", "B"]), "A,A1,A2,B");
});
test("partially mounted DOM retains unseen state entries in order", () => {
  assert.equal(merge(["B", "B1"], ["A", "A1", "B", "B1", "C"]), "A,A1,B,B1,C");
});
test("state-only comments retain their order", () => {
  assert.equal(merge([], ["A", "A1", "B"]), "A,A1,B");
});
test("DOM-only comments retain their order and are deduplicated", () => {
  assert.equal(merge(["A", "A1", "A1", "B"], []), "A,A1,B");
});

function applyBatch(incoming) {
  let renders = 0;
  const context = vm.createContext({
    lastThreadDetail: { id: "note", detail: { pin: { id: "note" }, replies: ["A", "B"].map(comment) } },
    renderDetailThread: () => renders++,
    incoming,
  });
  vm.runInContext(extract("applyCommentBatch", "async function fillCommentsLater"), context);
  vm.runInContext("applyCommentBatch('note', incoming)", context);
  return { renders, context };
}

test("same-sized batch can correct ordering", () => {
  const { renders, context } = applyBatch(["B", "A"].map(comment));
  assert.equal(renders, 1);
  assert.equal(vm.runInContext("lastThreadDetail.detail.replies[0].id", context), "B");
});
for (const [field, value] of [["text", "edited"], ["avatar", "new"], ["likeCount", "2"]]) {
  test(`same-sized batch updates ${field}`, () => {
    assert.equal(applyBatch([{ ...comment("A"), [field]: value }, comment("B")]).renders, 1);
  });
}
test("unchanged snapshot does not cause repeated observer-driven rendering", () => {
  assert.equal(applyBatch(["A", "B"].map(comment)).renders, 0);
});
test("shorter loading snapshot does not discard previously collected comments", () => {
  assert.equal(applyBatch([comment("A")]).renders, 0);
});
test("the mutation observer's sync path collects comments in an open drawer", () => {
  let reads = 0;
  let applies = 0;
  const context = vm.createContext({
    detailView: { classList: { contains: () => true } },
    detailRenderedHref: "/explore/note",
    lastThreadDetail: { id: "note" },
    collectNoteComments: () => { reads++; return [comment("A")]; },
    applyCommentBatch: () => applies++,
  });
  vm.runInContext(extract("syncDetailDrawer", "function closeDetailDrawer"), context);
  vm.runInContext(extract("syncChatMessages", "function nearBottom"), context);
  vm.runInContext("syncChatMessages()", context);
  assert.equal(reads, 1);
  assert.equal(applies, 1);
});

// Deterministic 100px rows model insertion above a partially visible comment.
// The real renderer runs; only DOM geometry and the row template are supplied.
function renderAt(top, oldIds, newIds, note = "note") {
  let ids = oldIds;
  const body = {
    dataset: { pinId: "note" },
    scrollTop: top,
    querySelector: () => null,
    getBoundingClientRect: () => ({ top: 100, bottom: 400 }),
    querySelectorAll: () => ids.map((id, index) => ({
      dataset: { id },
      getBoundingClientRect: () => ({
        top: 100 + index * 100 - body.scrollTop,
        bottom: 200 + index * 100 - body.scrollTop,
      }),
    })),
  };
  Object.defineProperty(body, "innerHTML", {
    set(html) {
      ids = html.split("\n").filter((line) => line && !line.startsWith("<"));
      body.scrollTop = 0;
    },
  });
  const context = vm.createContext({
    detailView: { querySelector: (selector) => selector === ".im-detail-body" ? body : null },
    threadPinHtml: () => "",
    msgHtml: (item) => `${item.id}\n`,
    snip: (text) => text,
    detail: { pin: { id: note }, replies: newIds.map(comment) },
  });
  vm.runInContext(extract("renderDetailThread", "function openTweetDetail"), context);
  vm.runInContext("renderDetailThread(detail)", context);
  return body.scrollTop;
}

test("insertion above the viewport retains the visible comment", () => {
  assert.equal(renderAt(200, ["A", "A1", "B"], ["A", "A1", "A2", "B"]), 300);
});
test("partially clipped comment retains its exact offset", () => {
  assert.equal(renderAt(225, ["A", "A1", "B"], ["A", "A1", "A2", "B"]), 325);
});
test("the top stays at the top when comments arrive", () => {
  assert.equal(renderAt(0, ["A", "B"], ["A", "A1", "B"]), 0);
});
test("removed anchor retains the previous scroll position", () => {
  assert.equal(renderAt(200, ["A", "A1", "B", "C"], ["A", "A1", "C"]), 200);
});
test("a different note starts at the top", () => {
  assert.equal(renderAt(200, ["A", "A1", "B"], ["C", "D"], "other"), 0);
});
test("pagination skips the non-scrollable outer interaction container", () => {
  const outer = { scrollTop: 0, scrollHeight: 554, clientHeight: 554, overflow: "visible", dispatchEvent() {} };
  const inner = { scrollTop: 0, scrollHeight: 11919, clientHeight: 401, overflow: "scroll", dispatchEvent() {} };
  const root = { querySelector: () => outer, querySelectorAll: () => [outer, inner] };
  const context = vm.createContext({
    noteContainer: () => root,
    getComputedStyle: (node) => ({ overflowY: node.overflow }),
    Event: class Event {},
  });
  vm.runInContext(extract("kickCommentScroller", "function commentMoreButtons"), context);
  vm.runInContext("kickCommentScroller()", context);
  assert.equal(inner.scrollTop, 11919);
  assert.equal(outer.scrollTop, 0);
});
