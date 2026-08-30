// 钉钉式沉浸图片浮窗灯箱
import { escapeHtml } from "../utils/html.js";
import { ICONS } from "../config/icons.js";
import { chatHooks } from "../ui/hooks.js";

let activeImgModal = null;


function openImImageModal(src, _triggerImg) {
  if (!src) return;
  if (activeImgModal) closeImImageModal();

  let scale = 1;
  let rotate = 0;
  let isDragging = false;
  let startX = 0, startY = 0;
  let translateX = 0, translateY = 0;

  const modal = document.createElement("div");
  modal.className = "im-img-modal";
  modal.tabIndex = -1;

  modal.innerHTML = `
    <div class="im-img-modal-backdrop"></div>
    <div class="im-img-modal-toolbar">
      <button type="button" class="im-img-btn" data-action="zoom-in" title="放大">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button type="button" class="im-img-btn" data-action="zoom-out" title="缩小">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button type="button" class="im-img-btn" data-action="reset" title="还原">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
      </button>
      <button type="button" class="im-img-btn" data-action="rotate" title="旋转">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
      </button>
      <a href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer" class="im-img-btn" title="在新标签页打开原图">${ICONS.external}</a>
      <button type="button" class="im-img-btn im-img-close" data-action="close" title="关闭 (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="im-img-modal-stage">
      <img class="im-img-modal-img" src="${escapeHtml(src)}" alt="预览图片" draggable="false">
    </div>`;

  document.body.appendChild(modal);
  activeImgModal = modal;

  const img = modal.querySelector(".im-img-modal-img");
  const backdrop = modal.querySelector(".im-img-modal-backdrop");
  const stage = modal.querySelector(".im-img-modal-stage");

  function updateTransform(smooth = false) {
    if (!img) return;
    img.style.transition = smooth ? "transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)" : "none";
    img.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
    img.style.cursor = scale > 1.05 ? (isDragging ? "grabbing" : "grab") : "zoom-in";
  }

  requestAnimationFrame(() => {
    modal.classList.add("is-active");
    updateTransform(true);
  });

  function close() {
    if (!modal.isConnected) return;
    modal.classList.remove("is-active");
    modal.classList.add("is-closing");
    setTimeout(() => {
      modal.remove();
      if (activeImgModal === modal) activeImgModal = null;
    }, 200);
    document.removeEventListener("keydown", onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  }
  document.addEventListener("keydown", onKeyDown);

  modal.addEventListener("click", (e) => {
    const btn = e.target.closest(".im-img-btn");
    if (btn) {
      const action = btn.dataset.action;
      if (action === "close") close();
      else if (action === "zoom-in") { scale = Math.min(scale * 1.3, 5); updateTransform(true); }
      else if (action === "zoom-out") { scale = Math.max(scale / 1.3, 0.3); updateTransform(true); }
      else if (action === "reset") { scale = 1; translateX = 0; translateY = 0; rotate = 0; updateTransform(true); }
      else if (action === "rotate") { rotate = (rotate + 90) % 360; updateTransform(true); }
      return;
    }
    if (e.target === backdrop || e.target === stage) close();
  });

  modal.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1.15 : 0.88;
    scale = Math.min(Math.max(scale * delta, 0.3), 6);
    updateTransform(false);
  }, { passive: false });

  img.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    img.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform(false);
  });

  window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    updateTransform(false);
  });

  img.addEventListener("dblclick", (e) => {
    e.preventDefault();
    if (scale > 1.2) { scale = 1; translateX = 0; translateY = 0; }
    else { scale = 2; }
    updateTransform(true);
  });
}
function closeImImageModal() {
  if (activeImgModal) {
    activeImgModal.remove();
    activeImgModal = null;
  }
}





/* ============================== 引用楼层跳转与返回堆栈 ============================== */

// chatHooks 自注册（入口 import 即生效）
Object.assign(chatHooks, { openImageModal: openImImageModal });
