// 话题 AI 总结：POST /discourse-ai/summarization/t/:id（stream=true），
// 再经页面 MessageBus 频道 /discourse-ai/summaries/topic/:id 收流式增量。
// 气泡插在主贴（1 楼）下方：加载中 → 逐字更新 → 完成后 markdown 渲染。
import { csrfToken } from "../bridge/api.js";
import { pg } from "../bridge/page.js";
import { topicIdFromPath } from "../bridge/router.js";
import { chatState } from "../state/chat-state.js";
import { ICONS } from "../config/icons.js";
import { AI_NAME_KEY, AI_AVATAR_KEY, AI_DEFAULT_NAME } from "../config/constants.js";
import { escapeHtml } from "../utils/html.js";
import { mdToHtml } from "../ui/markdown-lite.js";
import { chatHooks } from "../ui/hooks.js";

const CHANNEL_PREFIX = "/discourse-ai/summaries/topic/";
const FIRST_CHUNK_MS = 45_000;
const STALL_MS = 90_000;

/** @typedef {"idle" | "loading" | "streaming" | "done" | "error"} SummaryStatus */

/** @type {Map<number, { status: SummaryStatus, text: string, error: string }>} */
const cache = new Map();

let busChannel = null;
let busHandler = null;
let firstTimer = 0;
let stallTimer = 0;
let requestSeq = 0;

function currentTopicId() {
  return chatState.topicId || topicIdFromPath(location.pathname);
}

function topicCache(topicId) {
  let row = cache.get(topicId);
  if (!row) {
    row = { status: "idle", text: "", error: "" };
    cache.set(topicId, row);
  }
  return row;
}

function extractSummary(raw) {
  if (raw == null) return { text: "", done: false };
  let data = raw;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch { return { text: "", done: false }; }
  }
  if (typeof data !== "object") return { text: "", done: false };
  // MessageBus 少数版本会把整包 {channel,data,message_id} 丢给回调
  if (data.data && (data.channel || data.message_id != null || data.global_id != null)) {
    data = data.data;
  }
  if (typeof data !== "object" || data == null) return { text: "", done: false };
  const payload = data.ai_topic_summary || data.summary || data;
  const text = String(
    payload?.summarized_text || payload?.summary || payload?.text || data.summarized_text || ""
  );
  const done = !!(data.done || payload?.done);
  return { text, done };
}

function summaryHtml(text) {
  const src = String(text || "").trim();
  if (!src) return "";
  try {
    return src.split(/\n{2,}/).map((part) => mdToHtml(part)).join("");
  } catch {
    return escapeHtml(src).replace(/\n/g, "<br>");
  }
}

function httpError(status, body) {
  if (status === 403) return "没有权限或需要登录后才能总结";
  if (status === 404) return "本站未开启 AI 总结";
  if (status === 429) return "请求过于频繁，请稍后再试";
  if (status === 422) return "这篇帖子暂时无法总结";
  try {
    const json = JSON.parse(body);
    const msg = json.errors?.[0] || json.error || json.extras?.reason;
    if (msg) return String(msg);
  } catch { /* 非 JSON */ }
  return `总结失败（HTTP ${status}）`;
}

function toast(message, el) {
  chatHooks.toast?.(message, el);
}

const AI_NAME_MAX = 24;
const AI_AVATAR_PX = 96;

let identCache = null;
function getIdentity() {
  if (identCache) return identCache;
  let name = AI_DEFAULT_NAME;
  let avatar = "";
  try {
    name = localStorage.getItem(AI_NAME_KEY) || AI_DEFAULT_NAME;
    avatar = localStorage.getItem(AI_AVATAR_KEY) || "";
  } catch { /* ignore */ }
  identCache = { name: String(name || "").trim() || AI_DEFAULT_NAME, avatar };
  return identCache;
}

function setIdentity({ name, avatar } = {}) {
  identCache = null;
  try {
    if (name != null) {
      const next = String(name).trim().slice(0, AI_NAME_MAX) || AI_DEFAULT_NAME;
      localStorage.setItem(AI_NAME_KEY, next);
    }
    if (avatar === "") localStorage.removeItem(AI_AVATAR_KEY);
    else if (avatar != null) localStorage.setItem(AI_AVATAR_KEY, avatar);
  } catch (err) {
    toast(String(err?.name) === "QuotaExceededError" ? "头像太大，请换一张更小的图" : "无法保存设置");
    return false;
  }
  return true;
}

function avatarMarkup(avatar) {
  if (avatar) return `<img src="${escapeHtml(avatar)}" alt="" draggable="false">`;
  return ICONS.doubao;
}

function paintIdentity(root) {
  const el = root || document.querySelector(".im-ai-summary");
  if (!el) return;
  const { name, avatar } = getIdentity();
  const av = el.querySelector(".im-ai-avatar");
  const nm = el.querySelector(".im-ai-name");
  if (av) {
    av.title = `点击更换头像（${name}）`;
    av.innerHTML = avatarMarkup(avatar);
  }
  if (nm) {
    nm.title = "点击修改昵称";
    nm.textContent = name;
  }
}

function fileToAvatarDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type || "")) {
      reject(new Error("请选择图片文件"));
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = AI_AVATAR_PX;
      canvas.height = AI_AVATAR_PX;
      const ctx = canvas.getContext("2d");
      const side = Math.min(img.width, img.height) || AI_AVATAR_PX;
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, AI_AVATAR_PX, AI_AVATAR_PX);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片无法读取"));
    };
    img.src = url;
  });
}

let idPop = null;
function closeIdentityPop() {
  idPop?.remove();
  idPop = null;
  document.removeEventListener("click", onIdPopOutside, true);
  document.removeEventListener("keydown", onIdPopKey, true);
}
function onIdPopOutside(e) {
  if (idPop && !idPop.contains(e.target) && !e.target.closest?.(".im-ai-avatar, .im-ai-name")) {
    closeIdentityPop();
  }
}
function onIdPopKey(e) {
  if (e.key === "Escape") closeIdentityPop();
}

function openIdentityPop(anchor) {
  closeIdentityPop();
  const { name, avatar } = getIdentity();
  const pop = document.createElement("div");
  pop.className = "im-ai-id-pop";
  pop.innerHTML =
    `<div class="im-ai-id-row">` +
    `<button type="button" class="im-ai-id-preview" title="点击或拖入图片更换头像">${avatarMarkup(avatar)}</button>` +
    `<div class="im-ai-id-fields">` +
    `<label>昵称</label>` +
    `<input class="im-ai-id-name" type="text" maxlength="${AI_NAME_MAX}" value="${escapeHtml(name)}" spellcheck="false">` +
    `<input class="im-ai-id-url" type="url" placeholder="或粘贴图片 URL" spellcheck="false">` +
    `</div></div>` +
    `<div class="im-ai-id-actions">` +
    `<button type="button" class="im-ai-id-reset">恢复默认</button>` +
    `</div>` +
    `<input type="file" class="im-ai-id-file" accept="image/*" hidden>`;
  document.body.appendChild(pop);

  const r = anchor.getBoundingClientRect();
  const mw = pop.offsetWidth;
  const mh = pop.offsetHeight;
  let left = Math.max(8, Math.min(r.left, innerWidth - mw - 8));
  let top = r.bottom + 8;
  if (top + mh > innerHeight - 8) top = Math.max(8, r.top - mh - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${top}px`;
  idPop = pop;

  const nameInput = pop.querySelector(".im-ai-id-name");
  const urlInput = pop.querySelector(".im-ai-id-url");
  const fileInput = pop.querySelector(".im-ai-id-file");
  const preview = pop.querySelector(".im-ai-id-preview");

  const saveName = () => {
    if (setIdentity({ name: nameInput.value })) paintIdentity();
  };
  nameInput.addEventListener("change", saveName);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); saveName(); closeIdentityPop(); }
  });

  const applyAvatar = (src) => {
    if (!setIdentity({ avatar: src })) return;
    preview.innerHTML = avatarMarkup(getIdentity().avatar);
    paintIdentity();
  };

  const pickFile = () => fileInput.click();
  preview.addEventListener("click", pickFile);
  preview.addEventListener("dragover", (e) => { e.preventDefault(); preview.classList.add("is-drop"); });
  preview.addEventListener("dragleave", () => preview.classList.remove("is-drop"));
  preview.addEventListener("drop", async (e) => {
    e.preventDefault();
    preview.classList.remove("is-drop");
    const file = [...(e.dataTransfer?.files || [])].find((f) => /^image\//.test(f.type));
    if (!file) return;
    try { applyAvatar(await fileToAvatarDataUrl(file)); }
    catch (err) { toast(err.message || "头像读取失败"); }
  });
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    try { applyAvatar(await fileToAvatarDataUrl(file)); }
    catch (err) { toast(err.message || "头像读取失败"); }
  });

  const saveUrl = () => {
    const v = urlInput.value.trim();
    if (!v) return;
    if (!/^(https?:\/\/|data:image\/)/i.test(v)) {
      toast("请输入 http(s) 或 data:image 链接");
      return;
    }
    applyAvatar(v);
    urlInput.value = "";
  };
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); saveUrl(); }
  });
  urlInput.addEventListener("change", saveUrl);

  pop.querySelector(".im-ai-id-reset").addEventListener("click", () => {
    setIdentity({ name: AI_DEFAULT_NAME, avatar: "" });
    paintIdentity();
    closeIdentityPop();
  });

  setTimeout(() => {
    document.addEventListener("click", onIdPopOutside, true);
    document.addEventListener("keydown", onIdPopKey, true);
    nameInput.focus();
    nameInput.select();
  }, 0);
}

function chatBody() {
  return document.querySelector(".im-chat-panel .im-chat-body");
}
function revealSummary() {
  chatBody()?.querySelector(".im-ai-summary")?.scrollIntoView({ block: "center", behavior: "smooth" });
}

function summarizeBtn() {
  return document.querySelector(".im-chat-summarize");
}

function syncButton(topicId) {
  const btn = summarizeBtn();
  if (!btn) return;
  const row = topicId ? cache.get(topicId) : null;
  const busy = row && (row.status === "loading" || row.status === "streaming");
  btn.classList.toggle("is-busy", !!busy);
  btn.title = busy ? "正在总结…" : row?.status === "done" ? "重新总结" : "AI 总结";
}

function loadingMarkup() {
  return `<div class="im-ai-loading" aria-label="正在总结"><i></i><i></i><i></i></div>`;
}

function bubbleSkeleton(row) {
  const busy = row.status === "loading" || row.status === "streaming";
  let inner;
  if (row.status === "loading" && !row.text) {
    inner = loadingMarkup();
  } else if (row.status === "error" && !row.text) {
    inner =
      `<div class="im-ai-error-text">${escapeHtml(row.error || "总结失败")}</div>` +
      `<button type="button" class="im-ai-retry">重试</button>`;
  } else if (row.status === "done") {
    inner = `<div class="im-ai-text is-cooked">${summaryHtml(row.text)}</div>`;
  } else {
    inner =
      `<div class="im-ai-stream"><span class="im-ai-text"></span>${busy ? `<span class="im-ai-caret" aria-hidden="true"></span>` : ""}</div>` +
      (row.status === "error"
        ? `<div class="im-ai-error-text">${escapeHtml(row.error)}</div><button type="button" class="im-ai-retry">重试</button>`
        : "");
  }
  const metaRight = row.status === "done" ? "完成" : row.status === "error" ? "失败" : "生成中";
  const { name, avatar } = getIdentity();
  return `
    <span class="im-msg-avatar im-ai-avatar" title="点击更换头像（${escapeHtml(name)}）">${avatarMarkup(avatar)}</span>
    <div class="im-msg-content">
      <span class="im-ai-name" title="点击修改昵称">${escapeHtml(name)}</span>
      <div class="im-msg-bubble" aria-live="polite">${inner}</div>
      <span class="im-msg-meta"><span>AI 总结</span><span class="im-ai-meta-state">${metaRight}</span></span>
    </div>`;
}

function fillStreamText(el, text) {
  const node = el.querySelector(".im-ai-text");
  if (node && !node.classList.contains("is-cooked")) node.textContent = text;
}

function placeBubble() {
  const topicId = currentTopicId();
  const body = chatBody();
  const panel = document.querySelector(".im-chat-panel");
  if (!body || !panel || !topicId) return false;

  const row = cache.get(topicId);
  if (!row || row.status === "idle") return false;

  // 加载/空态占位清掉，避免气泡插不进去又没有任何反馈
  for (const el of body.querySelectorAll(":scope > .im-chat-loading, :scope > .im-chat-empty, :scope > .im-chat-error")) {
    el.remove();
  }
  if (panel.dataset.empty === "1") panel.dataset.empty = "0";
  delete body.dataset.state;

  let el = body.querySelector(".im-ai-summary");
  if (!el) {
    el = document.createElement("div");
    el.className = "im-msg im-msg-other im-ai-summary";
    el.addEventListener("click", (e) => {
      const idHit = e.target.closest(".im-ai-avatar, .im-ai-name");
      if (idHit && el.contains(idHit)) {
        e.preventDefault();
        e.stopPropagation();
        openIdentityPop(idHit);
        return;
      }
      const retry = e.target.closest(".im-ai-retry");
      if (!retry || !el.contains(retry)) return;
      e.preventDefault();
      e.stopPropagation();
      startAiSummary({ force: true });
    });
  }
  el.classList.toggle("is-error", row.status === "error");
  el.classList.toggle("is-done", row.status === "done");
  const { name, avatar } = getIdentity();
  const sig = `${row.status}\0${row.text}\0${row.error || ""}\0${name}\0${avatar}`;
  if (el.dataset.sig !== sig) {
    el.innerHTML = bubbleSkeleton(row);
    el.dataset.sig = sig;
    if (row.text && row.status !== "done") fillStreamText(el, row.text);
  }

  const op = body.querySelector('.im-msg[data-post-number="1"]');
  if (op) {
    if (el.previousElementSibling !== op) op.after(el);
  } else if (body.firstElementChild !== el) {
    body.prepend(el);
  }
  syncButton(topicId);
  return true;
}

function clearTimers() {
  if (firstTimer) { clearTimeout(firstTimer); firstTimer = 0; }
  if (stallTimer) { clearTimeout(stallTimer); stallTimer = 0; }
}

function armFirstTimeout(topicId, seq) {
  if (firstTimer) clearTimeout(firstTimer);
  firstTimer = setTimeout(() => {
    if (seq !== requestSeq) return;
    const row = cache.get(topicId);
    if (!row || row.status !== "loading") return;
    fail(topicId, "等待总结超时，请重试");
  }, FIRST_CHUNK_MS);
}

function armStallTimeout(topicId, seq) {
  if (stallTimer) clearTimeout(stallTimer);
  stallTimer = setTimeout(() => {
    if (seq !== requestSeq) return;
    const row = cache.get(topicId);
    if (!row || row.status !== "streaming") return;
    fail(topicId, "总结中断，已保留已生成内容");
  }, STALL_MS);
}

function fail(topicId, message) {
  const row = topicCache(topicId);
  if (row.status === "done") return;
  row.status = "error";
  row.error = message;
  clearTimers();
  if (currentTopicId() === topicId) {
    placeBubble();
    toast(message, summarizeBtn());
  }
  syncButton(topicId);
}

function applyChunk(topicId, text, done) {
  const row = topicCache(topicId);
  if (text) row.text = text;
  if (done) {
    row.status = "done";
    row.error = "";
    clearTimers();
    unsubscribe();
  } else {
    row.status = "streaming";
    armStallTimeout(topicId, requestSeq);
    if (firstTimer) { clearTimeout(firstTimer); firstTimer = 0; }
  }
  if (currentTopicId() !== topicId) return;
  const el = chatBody()?.querySelector(".im-ai-summary");
  if (!el || done || row.status === "error") {
    placeBubble();
  } else if (!el.querySelector(".im-ai-text") || el.querySelector(".im-ai-loading")) {
    placeBubble();
  } else {
    fillStreamText(el, row.text);
    syncButton(topicId);
  }
}

function onBusMessage(data) {
  if (!busChannel || !busChannel.startsWith(CHANNEL_PREFIX)) return;
  const topicId = Number(busChannel.slice(CHANNEL_PREFIX.length));
  if (!topicId) return;
  const { text, done } = extractSummary(data);
  if (!text && !done) return;
  applyChunk(topicId, text, done);
}

function unsubscribe() {
  if (busChannel && busHandler && pg.MessageBus) {
    try { pg.MessageBus.unsubscribe(busChannel, busHandler); } catch { /* ignore */ }
  }
  busChannel = null;
  busHandler = null;
}

function subscribe(topicId) {
  const channel = CHANNEL_PREFIX + topicId;
  if (busChannel === channel && busHandler) return true;
  unsubscribe();
  const mb = pg.MessageBus;
  if (!mb || typeof mb.subscribe !== "function") return false;
  busHandler = onBusMessage;
  busChannel = channel;
  try {
    mb.subscribe(channel, busHandler, -1);
    return true;
  } catch (err) {
    console.warn("[linuxdo-im] MessageBus.subscribe failed", err);
    busChannel = null;
    busHandler = null;
    return false;
  }
}

async function requestSummary(topicId) {
  const headers = {
    Accept: "*/*",
    "X-CSRF-Token": csrfToken(),
    "X-Requested-With": "XMLHttpRequest",
    "Discourse-Logged-In": "true",
    "Discourse-Present": "true"
  };
  const url = `/discourse-ai/summarization/t/${topicId}`;
  const send = (method) => fetch(method === "GET" ? `${url}?stream=true` : url, {
    method,
    credentials: "same-origin",
    headers: method === "POST"
      ? { ...headers, "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }
      : headers,
    body: method === "POST" ? "stream=true" : undefined
  });

  let resp = await send("POST");
  if (!resp.ok && (resp.status === 404 || resp.status === 405)) {
    try {
      const alt = await send("GET");
      if (alt.ok) resp = alt;
    } catch { /* 保留 POST 错误 */ }
  }
  const raw = await resp.text();
  if (!resp.ok) throw new Error(httpError(resp.status, raw));
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

export function ensureAiSummaryButton(panel) {
  if (!panel) return;
  const actions = panel.querySelector(".im-chat-actions");
  if (!actions) return;
  let btn = actions.querySelector(".im-chat-summarize");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-icon-btn im-chat-summarize";
    btn.title = "AI 总结";
    btn.innerHTML = `${ICONS.spark}<span>总结</span>`;
    const native = actions.querySelector(".im-chat-native");
    if (native) actions.insertBefore(btn, native);
    else actions.appendChild(btn);
  } else if (!btn.querySelector("span")) {
    btn.insertAdjacentHTML("beforeend", "<span>总结</span>");
  }
  syncButton(currentTopicId());
}

export function syncAiSummary() {
  const topicId = currentTopicId();
  syncButton(topicId);
  if (!topicId) return;
  const row = cache.get(topicId);
  if (row && row.status !== "idle") placeBubble();
}

export async function startAiSummary(opts = {}) {
  const topicId = currentTopicId();
  const btn = summarizeBtn();
  if (!topicId) {
    toast("请先打开一个话题再总结", btn);
    return;
  }
  const row = topicCache(topicId);
  if (!opts.force && (row.status === "loading" || row.status === "streaming")) {
    placeBubble();
    revealSummary();
    toast("正在总结…", btn);
    return;
  }

  const seq = ++requestSeq;
  row.status = "loading";
  row.text = "";
  row.error = "";
  const placed = placeBubble();
  revealSummary();
  if (!placed) toast("正在总结…", btn);

  if (!subscribe(topicId)) {
    fail(topicId, "实时通道未就绪，请刷新页面后重试");
    return;
  }
  armFirstTimeout(topicId, seq);
  await new Promise((r) => setTimeout(r, 50));
  if (seq !== requestSeq) return;

  try {
    const json = await requestSummary(topicId);
    if (seq !== requestSeq) return;
    const { text, done } = extractSummary(json);
    if (text) {
      applyChunk(topicId, text, done || json.success !== "OK");
    }
  } catch (err) {
    if (seq !== requestSeq) return;
    fail(topicId, err?.message || "总结请求失败");
  }
}

Object.assign(chatHooks, {
  ensureAiSummaryButton,
  syncAiSummary,
  startAiSummary
});
