export function ensureStripDingtalk() {
  // 钉钉布局不使用窄条；若残留则移除
  document.querySelector(".im-strip")?.remove();
  return null;
}
