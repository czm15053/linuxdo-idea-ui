// 图片灯箱：点击聊天/线程卡图片打开沉浸式大图（拖拽/缩放/旋转/滚轮/双击）
// 样式复用 im 皮肤注入的 .im-img-modal（core-extra.css.js）
import { escapeHtml } from "../utils/html.js";
import { ICONS } from "../config/icons.js";
import { findTweetArticle, kickNativeVideo } from "../bridge/x-dom.js";


let activeImgModal = null;

export function openImImageModal(src, photos = []) {
  if (!src) return;
  closeImVideoModal();
  closeImImageModal();

  // 多图帖：photos 传整组图，弹窗内左右按钮/键盘切换；单图行为不变
  const list = (Array.isArray(photos) && photos.length) ? [...photos].filter(Boolean) : [src];
  let idx = list.indexOf(src);
  if (idx < 0) idx = 0;
  const multi = list.length > 1;

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
      <a href="${escapeHtml(list[idx])}" target="_blank" rel="noopener noreferrer" class="im-img-btn im-img-open" title="在新标签页打开原图">${ICONS.external}</a>
      ${multi ? `<span class="im-img-count"></span>` : ""}
      <button type="button" class="im-img-btn im-img-close" data-action="close" title="关闭 (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="im-img-modal-stage">
      ${multi ? `<button type="button" class="im-img-nav im-img-prev" title="上一张 (←)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>` : ""}
      <img class="im-img-modal-img" src="${escapeHtml(list[idx])}" alt="预览图片" draggable="false">
      ${multi ? `<button type="button" class="im-img-nav im-img-next" title="下一张 (→)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></button>` : ""}
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
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
      return;
    }
    if (multi && img) {
      if (e.key === "ArrowLeft") { e.preventDefault(); if (idx > 0) show(idx - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); if (idx < list.length - 1) show(idx + 1); }
    }
  }
  document.addEventListener("keydown", onKeyDown);

  modal.addEventListener("click", (e) => {
    const navBtn = e.target.closest(".im-img-nav");
    if (navBtn && multi) {
      const dir = navBtn.classList.contains("im-img-next") ? 1 : -1;
      const next = idx + dir;
      if (next >= 0 && next < list.length) show(next);
      return;
    }
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

  function onMove(e) {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform(false);
  }
  function onUp() {
    if (!isDragging) return;
    isDragging = false;
    updateTransform(false);
  }
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);

  img.addEventListener("dblclick", (e) => {
    e.preventDefault();
    if (scale > 1.2) { scale = 1; translateX = 0; translateY = 0; }
    else { scale = 2; }
    updateTransform(true);
  });

  /** 切换到第 i 张（越界自动钳制上/下）并重置缩放平移；更新计数、原图链接、边界按钮禁用态 */
  function show(i, smooth = true) {
    idx = Math.max(0, Math.min(list.length - 1, i));
    if (img) img.src = list[idx];
    const open = modal.querySelector(".im-img-open");
    if (open) open.setAttribute("href", list[idx]);
    const count = modal.querySelector(".im-img-count");
    if (count) count.textContent = `${idx + 1} / ${list.length}`;
    const prev = modal.querySelector(".im-img-prev");
    const next = modal.querySelector(".im-img-next");
    if (prev) prev.disabled = idx === 0;
    if (next) next.disabled = idx === list.length - 1;
    scale = 1; rotate = 0; translateX = 0; translateY = 0;
    updateTransform(smooth);
  }
  if (multi) show(idx, false);
}

function closeImImageModal() {
  if (activeImgModal) {
    activeImgModal.remove();
    activeImgModal = null;
  }
}

let activeVideoModal = null;
let parkedVideo = null;

function restoreParkedVideo() {
  if (!parkedVideo) return;
  const { host, parent, next, style } = parkedVideo;
  parkedVideo = null;
  try {
    host.querySelector("video")?.pause();
    host.classList.remove("xim-video-lifted");
    if (style == null) host.removeAttribute("style");
    else host.setAttribute("style", style);
    if (parent?.isConnected) parent.insertBefore(host, next);
  } catch { /* ignore */ }
}

export function closeImVideoModal() {
  restoreParkedVideo();
  if (activeVideoModal) {
    activeVideoModal.remove();
    activeVideoModal = null;
  }
}

/** 内联播放专用：进度条默认隐藏，hover 到视频上才显示（移出 500ms 后收回，避免拖进度时消失） */
function bindHoverControls(host, vid) {
  if (vid.__ximHover) return;
  vid.__ximHover = true;
  vid.controls = false;
  let timer = 0;
  host.addEventListener("mouseenter", () => {
    window.clearTimeout(timer);
    vid.controls = true;
  });
  host.addEventListener("mouseleave", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { vid.controls = false; }, 500);
  });
}

function playNativeHost(host, hoverControls = false) {
  const vid = host.querySelector("video");
  if (vid) {
    vid.playsInline = true;
    vid.setAttribute("playsinline", "");
    if (hoverControls) bindHoverControls(host, vid);
    else vid.controls = true;
  }
  const tryPlay = () => vid?.play?.().catch(() => {});
  tryPlay();
  const btn = host.querySelector(
    '[aria-label="Play"], [aria-label="Play video"], [aria-label="Play Gif"], [aria-label="播放"], [aria-label="播放视频"], [aria-label="播放 Gif"], [data-testid="play"]'
  );
  if (btn) btn.click();
  else if (vid && vid.paused) host.click();
  setTimeout(tryPlay, 80);
}

function waitForNativeVideo(root, ms = 2500) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    const tick = () => {
      const vid = root?.querySelector("video");
      if (vid && (vid.currentSrc || vid.src || vid.readyState >= 1)) {
        resolve(vid);
        return;
      }
      if (Date.now() - t0 > ms) {
        resolve(vid || null);
        return;
      }
      requestAnimationFrame(tick);
    };
    tick();
  });
}

function liftHostInto(stage, host, inline, hoverControls = false) {
  if (!host) return false;
  // self-lift / 嵌套防护：宿主是舞台自身、已在舞台内、或舞台是宿主后代时——原地播放即可，绝不搬移清空
  if (host === stage || stage.contains(host) || host.contains(stage)) {
    stage.classList.add("is-playing");
    const v = stage.querySelector("video");
    if (v) {
      bindHoverControls(stage, v);
      v.play().catch(() => {});
    }
    return true;
  }
  if (!host.isConnected) return false;
  restoreParkedVideo();
  parkedVideo = {
    host,
    parent: host.parentNode,
    next: host.nextSibling,
    style: host.getAttribute("style"),
  };
  host.classList.add("xim-video-lifted");
  if (inline) host.classList.add("xim-video-inline");
  host.style.cssText = inline
    ? "position:absolute;inset:0;width:100%;height:100%;opacity:1;pointer-events:auto;background:#000;"
    : "position:relative;width:min(960px,92vw);max-height:80vh;opacity:1;pointer-events:auto;background:#000;";
  stage.classList.add("is-playing");
  stage.innerHTML = "";
  stage.appendChild(host);
  playNativeHost(host, hoverControls);
  return true;
}

// 原生 currentSrc 常是 blob:（MSE），仅在媒体活跃时有效、翻页即失效；播放兜底只接受 https 直链
const cleanVideoUrl = (u) => (u && typeof u === "string" && !u.startsWith("blob:")) ? u : "";

export async function playInlineVideo(container, { src = "", poster = "", tweetId = "" } = {}) {
  if (!container) return;
  // 双击 / 重复触发的并发锁：同一容器同时只跑一个播放流程
  if (container.__ximBusy) return;
  container.__ximBusy = true;
  try {
    await doPlayInlineVideo(container, { src, poster, tweetId });
  } finally {
    container.__ximBusy = false;
  }
}

async function doPlayInlineVideo(container, { src = "", poster = "", tweetId = "" }) {
  if (container.classList.contains("is-playing")) {
    const v = container.querySelector("video");
    if (v) {
      if (v.paused) v.play().catch(() => {});
      else v.pause();
      return;
    }
    container.classList.remove("is-playing");
  }
  closeImVideoModal();
  const article = findTweetArticle(tweetId);
  // 原生 <video> 只从 article 找；container 里即使遗留 fallback video 也不能当原生宿主抬走（会造成 self-lift 黑块）
  let vid = null;
  if (article) {
    kickNativeVideo(article);
    vid = await waitForNativeVideo(article, 2800);
  }
  const playable = cleanVideoUrl(src) || cleanVideoUrl(vid?.currentSrc) || cleanVideoUrl(vid?.src) || "";
  const playBtn = container.querySelector(".im-video-play");
  playBtn?.setAttribute("hidden", "");
  if (vid) {
    const host = vid.closest('[data-testid="videoPlayer"], [data-testid="videoComponent"]') || vid.parentElement || vid;
    if (liftHostInto(container, host, true, true)) return;
    container.classList.remove("is-playing");
  }
  if (playable) {
    restoreParkedVideo();
    const v = document.createElement("video");
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    if (poster) v.poster = poster;
    v.src = playable;
    container.innerHTML = "";
    container.appendChild(v);
    container.classList.add("is-playing");
    bindHoverControls(container, v);
    return;
  }
  playBtn?.removeAttribute("hidden");
}

export async function openImVideoModal({ src = "", poster = "", tweetId = "" } = {}) {
  closeImImageModal();
  closeImVideoModal();

  const article = findTweetArticle(tweetId);
  const marked = tweetId ? document.querySelector(`[data-xim-video="${tweetId}"]`) : null;
  let host = marked
    || article?.querySelector('[data-testid="videoPlayer"], [data-testid="videoComponent"]')
    || null;
  const nativeVid = host?.querySelector("video") || article?.querySelector("video");
  const playable = cleanVideoUrl(src) || cleanVideoUrl(nativeVid?.currentSrc) || cleanVideoUrl(nativeVid?.src) || "";

  const modal = document.createElement("div");
  modal.className = "im-img-modal im-video-modal";
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="im-img-modal-backdrop"></div>
    <div class="im-img-modal-toolbar">
      <button type="button" class="im-img-btn im-img-close" data-action="close" title="关闭 (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="im-img-modal-stage"></div>`;
  const stage = modal.querySelector(".im-img-modal-stage");

  if (poster && !playable) {
    const img = document.createElement("img");
    img.className = "im-video-modal-el";
    img.src = poster;
    img.alt = "视频加载中";
    stage.appendChild(img);
  }

  document.body.appendChild(modal);
  activeVideoModal = modal;
  requestAnimationFrame(() => modal.classList.add("is-active"));

  function close() {
    if (!modal.isConnected) return;
    restoreParkedVideo();
    modal.classList.remove("is-active");
    modal.classList.add("is-closing");
    setTimeout(() => {
      modal.remove();
      if (activeVideoModal === modal) activeVideoModal = null;
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
    if (e.target.closest("[data-action='close']") || e.target === modal.querySelector(".im-img-modal-backdrop")) close();
  });

  if (article) kickNativeVideo(article);
  const vid = await waitForNativeVideo(article || host, 2800);
  if (activeVideoModal !== modal) return;

  if (vid) {
    host = vid.closest('[data-testid="videoPlayer"], [data-testid="videoComponent"]') || vid.parentElement || host;
    if (host && liftHostInto(stage, host)) return;
    vid.controls = true;
    vid.autoplay = true;
    vid.muted = false;
    vid.classList.add("im-video-modal-el");
    stage.innerHTML = "";
    stage.appendChild(vid);
    vid.play().catch(() => {});
    return;
  }

  if (playable) {
    const v = document.createElement("video");
    v.className = "im-video-modal-el";
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    if (poster) v.poster = poster;
    v.src = playable;
    stage.innerHTML = "";
    stage.appendChild(v);
    return;
  }

  if (!stage.childElementCount) {
    stage.innerHTML = `<div class="im-video-miss">视频未就绪，请再点一次</div>`;
  }
}