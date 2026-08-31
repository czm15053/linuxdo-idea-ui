// 小火箭跟评（来自 mangen 版）：气泡内追加跟评 / 删除
import { csrfToken } from "../bridge/api.js";
import { escapeHtml } from "../utils/html.js";
import { ICONS } from "../config/icons.js";
import { getCurrentUsername } from "../bridge/user.js";
import { safeLookup, getEmberOwner } from "../bridge/discourse.js";
import { extractTextSnippet } from "../ui/chat-panel.js";
import { avatarColor, avatarLetter, fullAvatarUrl } from "../ui/shared/avatars.js";
import { showImToast } from "./interactions.js";
import { chatHooks } from "../ui/hooks.js";

function formatBoostCooked(cooked) {
  if (!cooked) return "";
  try {
    const div = document.createElement("div");
    div.innerHTML = cooked;
    div.querySelectorAll("p, div").forEach(p => {
      const span = document.createElement("span");
      span.innerHTML = p.innerHTML + " ";
      p.replaceWith(span);
    });
    div.querySelectorAll("*:not(img.emoji):not(span)").forEach(el => el.remove());
    div.querySelectorAll("img.emoji").forEach(img => {
      img.style.width = "18px";
      img.style.height = "18px";
      img.style.verticalAlign = "text-bottom";
      img.style.margin = "0 2px";
      img.style.display = "inline-block";
    });
    return div.innerHTML.trim();
  } catch {
    return escapeHtml(extractTextSnippet(cooked, 50) || "");
  }
}
function renderBoostsHtml(post, myName) {
  if (!myName) myName = getCurrentUsername();
  if (!post) return "";
  const boosts = post.boosts || [];
  if (!boosts.length && post.post_number !== 1) return "";

  let chips = "";
  for (const b of boosts) {
    const contentHtml = formatBoostCooked(b.cooked);
    const text = extractTextSnippet(b.cooked, 35) || "";
    const u = b.user || {};
    const uName = u.name || u.username || "佬友";

    let avatarSrc = "";
    if (u.animated_avatar) {
      avatarSrc = u.animated_avatar.startsWith("//") ? "https:" + u.animated_avatar : u.animated_avatar;
    } else if (u.avatar_template) {
      avatarSrc = fullAvatarUrl(u.avatar_template);
    }

    let avatarHtml = "";
    if (avatarSrc) {
      avatarHtml = `<span class="im-rocket-avatar-box"><img src="${escapeHtml(avatarSrc)}" alt="" loading="lazy"></span>`;
    } else {
      const letter = avatarLetter(uName);
      avatarHtml = `<span class="im-rocket-avatar-box"><span class="fallback-letter" style="background:${avatarColor(letter)}">${escapeHtml(letter)}</span></span>`;
    }

    const isMyBoost = (u.username && myName && u.username.toLowerCase() === myName.toLowerCase()) || b.can_delete;
    chips += `<span class="im-rocket-chip${isMyBoost ? " is-my-boost" : ""}" title="${escapeHtml(uName)}: ${escapeHtml(text)}" data-boost-id="${b.id || ''}">` +
      `${avatarHtml}<span class="im-rocket-text">${contentHtml || escapeHtml(text)}</span>` +
      (isMyBoost ? `<button type="button" class="im-rocket-trash" title="删除跟评" style="display:none;">${ICONS.trash}</button>` : "") +
      `</span>`;
  }

  return `
    <div class="im-rocket-bar" data-post-number="${post.post_number}">
      ${chips}
      <button type="button" class="im-rocket-btn" title="发射小火箭">${ICONS.rocket || "🚀"}</button>
    </div>`;
}
async function submitImBoost(postId, _postNum, content, msgEl, composerEl) {
  if (!postId || !content) return;
  const submitBtn = composerEl.querySelector(".im-boost-submit");
  if (submitBtn) submitBtn.style.opacity = "0.5";

  try {
    const token = csrfToken();
    let ok = false;
    let newBoostId = null;

    try {
      const r1 = await fetch(`/discourse-boosts/posts/${postId}/boosts`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "X-CSRF-Token": token,
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ raw: content })
      });
      if (r1.ok) {
        ok = true;
        const data = await r1.json().catch(() => ({}));
        newBoostId = (data && (data.id || data.boost?.id)) || null;
      }
    } catch { /* ignore */ }

    if (!ok) {
      try {
        const r2 = await fetch(`/discourse-boosts/posts/${postId}/boosts`, {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "X-CSRF-Token": token,
            "X-Requested-With": "XMLHttpRequest",
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
          },
          body: `raw=${encodeURIComponent(content)}`
        });
        if (r2.ok) {
          ok = true;
          const data = await r2.json().catch(() => ({}));
          newBoostId = (data && (data.id || data.boost?.id)) || null;
        }
      } catch { /* ignore */ }
    }

    if (!ok) {
      throw new Error("服务端拒绝了小火箭发送请求");
    }

    composerEl.remove();
    showImToast("✓ 小火箭跟评发送成功", msgEl);

    let rocketBar = msgEl.querySelector(".im-rocket-bar");
    if (!rocketBar) {
      rocketBar = document.createElement("div");
      rocketBar.className = "im-rocket-bar";
      const bubble = msgEl.querySelector(".im-msg-bubble");
      if (bubble) bubble.appendChild(rocketBar);
    }

    let myAvatarUrl = "";
    try {
      const u = safeLookup(getEmberOwner(), "service:current-user")?.currentUser || window.Discourse?.User?.current();
      if (u && u.avatar_template) myAvatarUrl = fullAvatarUrl(u.avatar_template);
    } catch { /* ignore */ }

    const newChip = document.createElement("span");
    newChip.className = "im-rocket-chip is-my-boost";
    if (newBoostId) newChip.dataset.boostId = String(newBoostId);
    newChip.innerHTML = `
      <span class="im-rocket-avatar-box">
        ${myAvatarUrl ? `<img src="${escapeHtml(myAvatarUrl)}" alt="">` : `<span style="font-size:10px;">我</span>`}
      </span>
      <span class="im-rocket-text">${escapeHtml(content)}</span>
      <button type="button" class="im-rocket-trash" title="删除跟评" style="display:none;">${ICONS.trash}</button>
    `;

    const plusBtn = rocketBar.querySelector(".im-rocket-btn");
    if (plusBtn) {
      rocketBar.insertBefore(newChip, plusBtn);
    } else {
      rocketBar.appendChild(newChip);
    }
  } catch (err) {
    console.error("[linuxdo-im] submitImBoost error:", err);
    if (submitBtn) submitBtn.style.opacity = "1";
    showImToast("跟评发送失败，请重试", composerEl);
  }
}
async function deleteImBoost(_postId, boostId, chipEl) {
  if (!boostId) {
    const chipText = chipEl.querySelector(".im-rocket-text")?.textContent.trim() || "";
    const targetCooked = Array.from(document.querySelectorAll(".discourse-boosts__cooked")).find((b) => b.textContent.includes(chipText));
    if (targetCooked) {
      let nativeDel = targetCooked.parentElement?.querySelector("button.discourse-boosts__delete");
      if (!nativeDel) {
        targetCooked.click();
        await new Promise((r) => setTimeout(r, 60));
        nativeDel = targetCooked.parentElement?.querySelector("button.discourse-boosts__delete");
      }
      if (nativeDel) {
        nativeDel.click();
        chipEl.remove();
        showImToast("✓ 跟评已删除", chipEl);
        return;
      }
    }
    showImToast("删除失败，未获取到跟评编号", chipEl);
    return;
  }

  const trashBtn = chipEl.querySelector(".im-rocket-trash");
  if (trashBtn) trashBtn.style.opacity = "0.4";

  try {
    const token = csrfToken();
    const headers = {
      "X-CSRF-Token": token,
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json"
    };

    const resp = await fetch(`/discourse-boosts/boosts/${boostId}`, {
      method: "DELETE",
      credentials: "same-origin",
      headers
    });

    if (!resp.ok && resp.status !== 200 && resp.status !== 204) {
      throw new Error(`HTTP ${resp.status}`);
    }

    chipEl.style.transition = "all 0.2s ease";
    chipEl.style.opacity = "0";
    chipEl.style.transform = "scale(0.8)";
    setTimeout(() => chipEl.remove(), 200);
    showImToast("✓ 跟评已删除", chipEl);
  } catch (err) {
    console.error("[linuxdo-im] deleteImBoost error:", err);
    if (trashBtn) trashBtn.style.opacity = "1";
    showImToast("删除失败，请刷新重试", chipEl);
  }
}
function openImBoostComposer(msgEl) {
  if (!msgEl) return;
  const existing = msgEl.querySelector(".im-boost-composer");
  if (existing) {
    existing.querySelector(".im-boost-input")?.focus();
    return;
  }

  document.querySelectorAll(".im-boost-composer").forEach((el) => el.remove());

  const postId = msgEl.dataset.postId;
  const postNum = msgEl.dataset.postNumber;
  const authorName = msgEl.querySelector(".im-msg-name")?.textContent.trim() || "";

  let myAvatar = "";
  try {
    const owner = getEmberOwner();
    const u = safeLookup(owner, "service:current-user")?.currentUser || window.Discourse?.User?.current();
    if (u && u.avatar_template) {
      myAvatar = `<img src="${escapeHtml(fullAvatarUrl(u.avatar_template))}" alt="">`;
    } else if (u && u.username) {
      myAvatar = escapeHtml(u.username.slice(0, 1).toUpperCase());
    }
  } catch { /* ignore */ }
  if (!myAvatar) {
    myAvatar = "我";
  }

  const composer = document.createElement("div");
  composer.className = "im-boost-composer";
  composer.innerHTML = `
    <div class="im-boost-avatar">${myAvatar}</div>
    <input type="text" class="im-boost-input" placeholder="Boost ${escapeHtml(authorName)}..." autocomplete="off" enterkeyhint="send">
    <div class="im-boost-emojis">
      <span class="im-quick-emoji" title="火箭">🚀</span>
      <span class="im-quick-emoji" title="点赞">👍</span>
      <span class="im-quick-emoji" title="爱心">❤️</span>
      <span class="im-quick-emoji" title="大笑">🤣</span>
      <span class="im-quick-emoji" title="庆祝">🎉</span>
      <span class="im-quick-emoji" title="火">🔥</span>
      <span class="im-quick-emoji" title="牛">🐮</span>
      <span class="im-quick-emoji" title="眼睛">👀</span>
    </div>
    <button type="button" class="im-boost-btn im-boost-submit" title="发送跟评">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </button>
    <button type="button" class="im-boost-btn im-boost-cancel" title="取消">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  const bubble = msgEl.querySelector(".im-msg-bubble");
  if (bubble && bubble.nextSibling) {
    msgEl.querySelector(".im-msg-content")?.insertBefore(composer, bubble.nextSibling);
  } else {
    msgEl.querySelector(".im-msg-content")?.appendChild(composer);
  }

  const input = composer.querySelector(".im-boost-input");
  composer.querySelectorAll(".im-quick-emoji").forEach(em => {
    em.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (input) {
        input.value += em.textContent.trim();
        input.focus();
      }
    });
  });
  input?.focus();

  const doSubmit = () => {
    const text = (input?.value || "").trim();
    if (!text) {
      input?.focus();
      return;
    }
    submitImBoost(postId, postNum, text, msgEl, composer);
  };

  composer.querySelector(".im-boost-submit")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    doSubmit();
  });

  composer.querySelector(".im-boost-cancel")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    composer.remove();
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      doSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      composer.remove();
    }
  });
}
/** 动态获取 Discourse 官方的不可撤销点赞原生提示语 */

// chatHooks 自注册（入口 import 即生效）
Object.assign(chatHooks, {
  openBoostComposer: openImBoostComposer,
  deleteBoost: deleteImBoost,
  renderBoosts: renderBoostsHtml,
});
