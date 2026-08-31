// 引用楼层跳转与返回堆栈
import { chatState } from "../state/chat-state.js";
import { scrollChatToPost } from "../ui/chat-panel.js";
import { chatHooks } from "../ui/hooks.js";

const quoteJumpHistory = [];


function pushQuoteJump(sourcePostNumber, sourceScrollTop) {
  if (!chatState.topicId) return;
  if (!sourcePostNumber && typeof sourceScrollTop !== "number") return;
  quoteJumpHistory.push({
    topicId: chatState.topicId,
    postNumber: sourcePostNumber,
    scrollTop: sourceScrollTop
  });
  updateJumpBackButton();
}
function updateJumpBackButton() {
  const panel = document.querySelector(".im-chat-panel");
  if (!panel) return;
  let btn = panel.querySelector(".im-jump-back-btn");
  if (!btn) {
    btn = document.createElement("button");
    btn.type = "button";
    btn.className = "im-jump-back-btn";
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="im-jump-back-text">返回原处</span>
      <span class="im-jump-back-close" title="关闭">✕</span>
    `;
    panel.appendChild(btn);
  }
  const currentTopicHistory = quoteJumpHistory.filter((item) => item.topicId === chatState.topicId);
  if (!currentTopicHistory.length) {
    // 基础/皮肤 CSS 都带 display:inline-flex !important，行内非 important 的 none 会被压掉
    btn.style.setProperty("display", "none", "important");
    return;
  }
  const last = currentTopicHistory[currentTopicHistory.length - 1];
  const textEl = btn.querySelector(".im-jump-back-text");
  if (textEl) {
    textEl.textContent = last.postNumber ? `返回 #${last.postNumber} 楼` : "返回原处";
  }
  btn.style.setProperty("display", "inline-flex", "important");
}
function clearQuoteJumpHistory() {
  quoteJumpHistory.length = 0;
  updateJumpBackButton();
}
async function popAndReturnQuoteJump() {
  // 只消费当前主题的栈：历史跨主题保留，全局 pop 可能弹到别的主题残留，
  // 导致当前主题按钮清不掉且跳转不动
  const itemIdx = quoteJumpHistory.map((entry) => entry.topicId).lastIndexOf(chatState.topicId);
  if (itemIdx === -1) return;
  const item = quoteJumpHistory[itemIdx];
  // 返回即视为离开引用链：清空当前主题剩余历史，按钮随之消失
  // （多级栈对用户不可见——按钮只展示最上层，保留残余历史只会表现为「点了不消失」）
  for (let i = quoteJumpHistory.length - 1; i >= 0; i--) {
    if (quoteJumpHistory[i].topicId === chatState.topicId) quoteJumpHistory.splice(i, 1);
  }
  updateJumpBackButton();
  if (!item) return;
  const panel = document.querySelector(".im-chat-panel");
  const body = panel ? panel.querySelector(".im-chat-body") : null;
  if (!body) return;

  if (item.postNumber) {
    if (scrollChatToPost(body, item.postNumber, true)) return;
    // 源窗口已被整窗重锚替换：远端取窗口跳回
    if (await chatHooks.jumpToPost?.(item.postNumber)) return;
  }
  if (typeof item.scrollTop === "number") {
    body.scrollTo({ top: item.scrollTop, behavior: "smooth" });
  }
}




/* ============================== 原生视图切换 ============================== */


// chatHooks 自注册（入口 import 即生效）
Object.assign(chatHooks, { pushQuoteJump, clearQuoteJumpHistory, popQuoteJump: popAndReturnQuoteJump });
