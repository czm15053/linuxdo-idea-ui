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