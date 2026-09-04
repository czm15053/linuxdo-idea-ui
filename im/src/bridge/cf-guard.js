// Cloudflare 盾检测：整页被 CF challenge / 拦截时返回 true。
// 命中后脚本整体停用（回原皮，不注入样式、不建 IM 面板、不锁明暗）；
// 挑战通过后 CF 以真实内容替换文档，MutationObserver 触发 applyTheme 复检，自动恢复皮肤。
//
// 判定策略（只取 CF 专属信号，避免误伤正常页面）：
//  - 旧式 challenge：明确的结构 id（#challenge-running / form#challenge-form 等），单信号即判；
//  - 新式 managed plus（Turnstile 内联 + closed shadowroot）：无 form#challenge-form，靠 CF 盾专属
//    标题识别。标题在 document-start 已可读，单信号即判还能避免「先套皮再回退」的闪烁
//    （Linux.do 正常页标题恒为「主题 - Linux.do」，不会命中）；
//  - 兜底：标题尚未就绪（磁盘缓存/预渲染）时，challenge 组件需与挑战专属结构同时出现。
//    不做孤立 widget 单判——linux.do 正常页可能残留孤立的 input#cf-chl-widget-*，会误伤。
export function cfBlocked() {
  try {
    if (document.querySelector("#challenge-running, #cf-challenge-running, form#challenge-form")) {
      return true;
    }
    const title = String(document.title || "").toLowerCase().replace(/…/g, "...");
    if (
      title.startsWith("just a moment") ||
      title.includes("attention required") ||
      title.includes("请稍候")
    ) {
      return true;
    }
    if (
      document.querySelector("input[type=hidden][id^='cf-chl-widget-'][name='cf-turnstile-response']") &&
      document.querySelector(".main-wrapper[role='main'], #challenge-error-text")
    ) {
      return true;
    }
  } catch {
    /* 忽略 */
  }
  return false;
}