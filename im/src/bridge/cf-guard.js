// Cloudflare 盾检测：整页被 CF challenge / 拦截时返回 true。
// 命中后脚本整体停用（回原皮，不注入样式、不建 IM 面板、不锁明暗）；
// 挑战通过后 CF 以真实内容替换文档，MutationObserver 触发 applyTheme 复检，自动恢复皮肤。
// 只取 CF 自己的稳定结构（challenge id/表单/标题），避免误伤正常页面。
export function cfBlocked() {
  try {
    if (document.querySelector("#challenge-running, #cf-challenge-running, form#challenge-form")) {
      return true;
    }
    const title = String(document.title || "").toLowerCase().replace(/…/g, "...");
    if (title.startsWith("just a moment") || title.includes("attention required")) {
      return true;
    }
  } catch {
    /* 忽略 */
  }
  return false;
}