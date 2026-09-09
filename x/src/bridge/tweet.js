// 推文发布与交互：100% 驱动原生 DOM 触发官方 React runtime，
// 由官方前端生成合法 x-client-transaction-id 签名与 GraphQL 载荷，避免调用已废弃的 1.1 REST 接口导致风控封号。
import { openCompose, findTweetArticle, extractStat, parseGroupStats } from "./x-dom.js";

function waitFor(sel, timeout = 3000) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const tick = () => {
      const el = document.querySelector(sel);
      if (el) { resolve(el); return; }
      if (Date.now() - t0 > timeout) { resolve(null); return; }
      setTimeout(tick, 60);
    };
    tick();
  });
}

// 回复：通过文章节点的原生回复按钮呼起回复弹层并提交（安全、不弹全新发帖页、由官方前端签名）
export async function replyViaModal(tweetId, text) {
  let art = tweetId ? findTweetArticle(tweetId) : null;
  let btn = art?.querySelector('[data-testid="reply"]');
  if (!btn && tweetId) {
    btn = document.querySelector(`article a[href*="/status/${tweetId}"]`)?.closest("article")?.querySelector('[data-testid="reply"]');
  }
  if (btn) {
    btn.click();
    const ta = await waitFor('[data-testid="tweetTextarea_0"], [data-testid="tweetTextarea_0_label"] textarea, div[contenteditable="true"][data-testid^="tweetTextarea"]', 2000);
    if (ta) {
      ta.focus();
      document.execCommand("insertText", false, text);
      const sendBtn = await waitFor('[data-testid="tweetButton"]', 1500);
      if (sendBtn && !sendBtn.disabled) {
        sendBtn.click();
        return true;
      }
    }
  }
  return false;
}

// 发推：打开官方 composer，填入文本并点发布（由官方前端签名与发出）
export async function sendViaModal(text) {
  openCompose();
  const ta = await waitFor('[data-testid="tweetTextarea_0"]');
  if (!ta) return false;
  ta.focus();
  document.execCommand("insertText", false, text);
  const btn = await waitFor('[data-testid="tweetButton"]', 1500);
  if (!btn) return false;
  btn.click();
  return true;
}

// DM 发送：原生 composer 藏在被隐藏的主栏内，直接驱动它（无弹窗，伪装最好）；找不到则失败回退
export async function sendDmViaNative(text) {
  const ta = document.querySelector(
    '[data-testid="dmComposerTextarea"], [data-testid="dmComposerInput"], textarea[aria-label*="Message"], textarea[aria-label^="私信"]'
  )
    || [...document.querySelectorAll('div[contenteditable="true"][data-testid]')].find((el) => /dm|message|私信/i.test(`${el.dataset.testid}${el.getAttribute("aria-label") || ""}`));
  if (!ta) return false;
  ta.focus();
  document.execCommand("insertText", false, text);
  const btn = await waitFor('[data-testid="dm-send"], [data-testid="dm-send-button"], [aria-label*="Send"][role="button"][tabindex]', 1200);
  if (!btn) return false;
  btn.click();
  return true;
}

// 点赞/取消点赞：完全通过点击可见原生 DOM，由官方前端同步 React 状态与网络请求
export async function toggleLike(id, wasLiked = false, article = null) {
  const art = article || (id ? findTweetArticle(id) : null);
  if (art) {
    const btn = art.querySelector(wasLiked ? '[data-testid="unlike"]' : '[data-testid="like"]');
    if (btn) {
      btn.click();
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 40));
        const nowLiked = !!art.querySelector('[data-testid="unlike"]');
        if (nowLiked !== wasLiked) {
          const groupEl = art.querySelector('[role="group"][aria-label]');
          const groupStats = parseGroupStats(groupEl?.getAttribute("aria-label") || "");
          const activeBtn = art.querySelector('[data-testid="unlike"], [data-testid="like"]');
          const realCount = extractStat(activeBtn) || groupStats.like || "";
          return { ok: true, liked: nowLiked, count: realCount };
        }
      }
      return { ok: true, liked: !wasLiked };
    }
  }
  return { ok: false };
}

// 转帖/取消转帖：点击原生按钮并自动确认原生弹出的 retweetConfirm
export async function toggleRetweet(id, wasRetweeted = false, article = null) {
  const art = article || (id ? findTweetArticle(id) : null);
  if (art) {
    const btn = art.querySelector(wasRetweeted ? '[data-testid="unretweet"]' : '[data-testid="retweet"]');
    if (btn) {
      btn.click();
      const confirmSel = wasRetweeted ? '[data-testid="unretweetConfirm"]' : '[data-testid="retweetConfirm"]';
      let confirmed = false;
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 40));
        const confirmBtn = document.querySelector(confirmSel);
        if (confirmBtn) {
          confirmBtn.click();
          confirmed = true;
          break;
        }
      }
      if (confirmed) {
        for (let i = 0; i < 12; i++) {
          await new Promise((r) => setTimeout(r, 40));
          const nowRt = !!art.querySelector('[data-testid="unretweet"]');
          if (nowRt !== wasRetweeted) {
            const groupEl = art.querySelector('[role="group"][aria-label]');
            const groupStats = parseGroupStats(groupEl?.getAttribute("aria-label") || "");
            const activeBtn = art.querySelector('[data-testid="unretweet"], [data-testid="retweet"]');
            const realCount = extractStat(activeBtn) || groupStats.retweet || "";
            return { ok: true, retweeted: nowRt, count: realCount };
          }
        }
        return { ok: true, retweeted: !wasRetweeted };
      }
    }
  }
  return { ok: false };
}

// 书签/取消书签：点击原生 DOM
export async function toggleBookmark(id, wasBookmarked = false, article = null) {
  const art = article || (id ? findTweetArticle(id) : null);
  if (art) {
    const btn = art.querySelector(wasBookmarked ? '[data-testid="removeBookmark"]' : '[data-testid="bookmark"]');
    if (btn) {
      btn.click();
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 40));
        const nowBm = !!art.querySelector('[data-testid="removeBookmark"]');
        if (nowBm !== wasBookmarked) {
          const groupEl = art.querySelector('[role="group"][aria-label]');
          const groupStats = parseGroupStats(groupEl?.getAttribute("aria-label") || "");
          const realCount = extractStat(btn) || groupStats.bookmark || "";
          return { ok: true, bookmarked: nowBm, count: realCount };
        }
      }
      return { ok: true, bookmarked: !wasBookmarked };
    }
  }
  return { ok: false };
}

// 查询个人主页的原生关注状态
export function getProfileFollowState() {
  const unfollowBtn = document.querySelector('button[data-testid$="-unfollow"]');
  if (unfollowBtn) return { visible: true, following: true, btn: unfollowBtn };
  const followBtn = document.querySelector('button[data-testid$="-follow"]');
  if (followBtn) return { visible: true, following: false, btn: followBtn };
  return { visible: false, following: false, btn: null };
}

// 个人主页关注/取消关注：驱动原生按钮并自动处理二次确认
export async function toggleFollowOnProfile() {
  const state = getProfileFollowState();
  if (!state.visible || !state.btn) return { ok: false, msg: "未找到关注按钮" };

  state.btn.click();

  if (state.following) {
    // 取关弹窗二次确认
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 40));
      const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
      if (confirmBtn) {
        confirmBtn.click();
        break;
      }
    }
  }

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 40));
    const nowState = getProfileFollowState();
    if (nowState.visible && nowState.following !== state.following) {
      return { ok: true, following: nowState.following };
    }
  }

  return { ok: true, following: !state.following };
}

// 通过推文的 caret 下拉菜单执行关注/取关（对应原生 menuitem: 关注 @handle / 取消关注 @handle）
export async function toggleFollowViaCaret(tweetId, wantUnfollow = false) {
  const art = tweetId ? findTweetArticle(tweetId) : null;
  const caret = art?.querySelector('[data-testid="caret"]');
  if (!caret) return { ok: false, msg: "未找到推文菜单按钮" };

  caret.click();

  let targetItem = null;
  let isUnfollowMenu = false;
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 40));
    const items = [...document.querySelectorAll('[role="menuitem"]')];
    for (const item of items) {
      const txt = (item.innerText || "").trim();
      const hasFollowIcon = !!item.querySelector('path[d*="M10 4c-1.105"]');
      const isMatch = hasFollowIcon || /^(?:关注|Follow|取消关注|Unfollow)\b/i.test(txt);
      if (isMatch) {
        targetItem = item;
        isUnfollowMenu = /^(?:取消关注|Unfollow)/i.test(txt);
        break;
      }
    }
    if (targetItem) break;
  }

  if (!targetItem) {
    document.body.click();
    return { ok: false, msg: "未找到关注选项" };
  }

  // 保护：如果点的是 "+ 关注"，但原生菜单其实已经是 "取消关注"（说明早已关注）
  if (!wantUnfollow && isUnfollowMenu) {
    document.body.click();
    return { ok: true, following: true, already: true };
  }

  targetItem.click();

  if (isUnfollowMenu) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 40));
      const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
      if (confirmBtn) {
        confirmBtn.click();
        break;
      }
    }
  }

  setTimeout(() => {
    for (const d of document.querySelectorAll('[data-testid="Dropdown"]')) {
      if (!d.hidden) document.body.click();
    }
  }, 80);

  return { ok: true, following: !isUnfollowMenu };
}

// 针对推文执行关注/取关：优先点击推文内的原生直接关注按钮，否则通过 caret 菜单项触发
export async function toggleTweetFollow(tweetId, wantUnfollow = false) {
  const art = tweetId ? findTweetArticle(tweetId) : null;
  if (art) {
    const directFollowBtn = art.querySelector('button[data-testid$="-follow"], div[role="button"][data-testid$="-follow"]');
    const directUnfollowBtn = art.querySelector('button[data-testid$="-unfollow"], div[role="button"][data-testid$="-unfollow"]');
    if (!wantUnfollow && directFollowBtn) {
      directFollowBtn.click();
      return { ok: true, following: true };
    }
    if (wantUnfollow && directUnfollowBtn) {
      directUnfollowBtn.click();
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 40));
        const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        if (confirmBtn) {
          confirmBtn.click();
          break;
        }
      }
      return { ok: true, following: false };
    }
  }
  return toggleFollowViaCaret(tweetId, wantUnfollow);
}