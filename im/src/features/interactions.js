// 轻提示 toast + 消息点赞（likedPosts 本地镜像）
import { csrfToken } from "../bridge/api.js";
import { ICONS } from "../config/icons.js";
import { likedPosts } from "./liked-posts.js";
import { chatHooks } from "../ui/hooks.js";

function getNativeCantUndoText(postNumber) {
  if (postNumber) {
    const nativeBtn = document.querySelector(
      `#post_${postNumber} button.btn-toggle-reaction-like, #post_${postNumber} button[class*='like'], #post_${postNumber} button[class*='reaction']`
    );
    const nativeTitle = nativeBtn?.getAttribute("title") || nativeBtn?.getAttribute("data-tooltip");
    if (nativeTitle && !nativeTitle.startsWith("[")) return nativeTitle;
  }
  try {
    if (typeof window !== "undefined" && window.I18n && typeof window.I18n.t === "function") {
      const candidates = [
        "js.discourse_reactions.state.cant_remove_reaction",
        "discourse_reactions.state.cant_remove_reaction",
        "js.discourse_reactions.cant_remove_reaction",
        "discourse_reactions.cant_remove_reaction"
      ];
      for (const k of candidates) {
        const res = window.I18n.t(k);
        if (res && typeof res === "string" && !res.startsWith("[") && !res.includes("missing")) {
          return res;
        }
      }
    }
  } catch { /* ignore */ }
  return "您无法再移除您自己的回应了";
}
export function showImToast(message, targetEl) {
  if (!message) return;
  document.querySelectorAll(".im-toast").forEach((el) => el.remove());

  const toast = document.createElement("div");
  toast.className = "im-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  if (targetEl && targetEl.getBoundingClientRect) {
    const rect = targetEl.getBoundingClientRect();
    const toastW = toast.offsetWidth || 180;
    const toastH = toast.offsetHeight || 32;

    let left = rect.left + rect.width / 2 - toastW / 2;
    left = Math.max(12, Math.min(window.innerWidth - toastW - 12, left));

    let top = rect.top - toastH - 8;
    if (top < 10) {
      top = rect.bottom + 8;
    }
    toast.style.left = `${left}px`;
    toast.style.top = `${top}px`;
  } else {
    toast.style.top = "60px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
  }

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 220);
  }, 2400);
}
export async function toggleLike(postId, triggerEl) {
  if (!postId) return;
  const msg = triggerEl.closest(".im-msg");
  const wasLiked = likedPosts.has(postId);
  const badge = msg ? msg.querySelector(".im-like-badge") : null;
  const toolBtn = msg ? msg.querySelector('.im-msg-tool[data-action="like"]') : null;
  const postNum = msg ? Number(msg.dataset.postNumber) : null;

  const canUndo = (badge && badge.dataset.canUndo === "0") || (toolBtn && toolBtn.dataset.canUndo === "0") ? false : true;
  if (wasLiked && !canUndo) {
    showImToast(getNativeCantUndoText(postNum), triggerEl);
    return;
  }

  let currentCount = badge ? (Number(badge.dataset.likes) || 0) : 0;
  let nextCount = wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

  if (wasLiked) likedPosts.delete(postId); else likedPosts.add(postId);

  if (badge) {
    badge.classList.toggle("liked", !wasLiked);
    badge.dataset.likes = String(nextCount);
    const countEl = badge.querySelector(".im-like-count");
    if (countEl) countEl.textContent = nextCount > 0 ? String(nextCount) : "";
    const iconEl = badge.querySelector(".im-like-icon");
    if (iconEl) iconEl.innerHTML = !wasLiked ? ICONS.heartFilled : ICONS.heartOutline;
    badge.style.display = (nextCount > 0 || !wasLiked) ? "inline-flex" : "none";
    badge.title = !wasLiked ? "已点赞，点击取消" : "点赞";
    badge.classList.remove("pop");
    void badge.offsetWidth;
    badge.classList.add("pop");
  }

  if (toolBtn) {
    toolBtn.classList.toggle("liked", !wasLiked);
    toolBtn.innerHTML = !wasLiked ? ICONS.heartFilled : (ICONS.heartOutline || ICONS.like);
    toolBtn.title = !wasLiked ? "已点赞，点击取消" : "点赞";
    toolBtn.classList.remove("pop");
    void toolBtn.offsetWidth;
    toolBtn.classList.add("pop");
  }

  try {
    const token = csrfToken();
    let success = false;
    const headers = {
      "X-CSRF-Token": token,
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json"
    };

    const url = wasLiked
      ? `/post_actions/${postId}.json?post_action_type_id=2`
      : "/post_actions.json";

    const opts = wasLiked
      ? { method: "DELETE", credentials: "same-origin", headers }
      : {
          method: "POST",
          credentials: "same-origin",
          headers: { ...headers, "Content-Type": "application/x-www-form-urlencoded" },
          body: `id=${postId}&post_action_type_id=2`
        };

    try {
      const resp = await fetch(url, opts);
      if (resp.ok) success = true;
    } catch { /* ignore */ }

    if (!success) {
      try {
        const rToggle = await fetch(`/discourse-reactions/posts/${postId}/custom-reactions/heart/toggle.json`, {
          method: "PUT",
          credentials: "same-origin",
          headers
        });
        if (rToggle.ok) success = true;
      } catch { /* ignore */ }
    }

    if (!success) {
      throw new Error(wasLiked ? getNativeCantUndoText(postNum) : "点赞操作未能完成");
    }
  } catch (err) {
    console.warn("[linuxdo-im] toggleLike error, rollback:", err);
    const tipText = wasLiked ? getNativeCantUndoText(postNum) : (err.message || "点赞操作未能完成");
    showImToast(tipText, triggerEl);
    if (wasLiked) likedPosts.add(postId); else likedPosts.delete(postId);

    if (badge) {
      badge.classList.toggle("liked", wasLiked);
      badge.dataset.likes = String(currentCount);
      const countEl = badge.querySelector(".im-like-count");
      if (countEl) countEl.textContent = currentCount > 0 ? String(currentCount) : "";
      const iconEl = badge.querySelector(".im-like-icon");
      if (iconEl) iconEl.innerHTML = wasLiked ? ICONS.heartFilled : ICONS.heartOutline;
      badge.style.display = currentCount > 0 ? "inline-flex" : "none";
      badge.title = wasLiked ? getNativeCantUndoText(postNum) : "点赞";
    }

    if (toolBtn) {
      toolBtn.classList.toggle("liked", wasLiked);
      toolBtn.innerHTML = wasLiked ? ICONS.heartFilled : (ICONS.heartOutline || ICONS.like);
      toolBtn.title = wasLiked ? getNativeCantUndoText(postNum) : "点赞";
    }
  }
}


/* ============================== 钉钉式沉浸图片浮窗灯箱 ============================== */


// chatHooks 自注册（入口 import 即生效）
Object.assign(chatHooks, { toast: showImToast, toggleLike, cantUndoText: getNativeCantUndoText });
