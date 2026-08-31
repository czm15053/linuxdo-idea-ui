// 原生 composer 桥：Ember service 可用性探测 + #reply-control 开合监听。
// 只读不写：不搬 Ember DOM（Glimmer 自管渲染），状态同步交由 index.js 切类名。
import { isComposerOpen } from "../bridge/discourse.js";

/**
 * 监听 #reply-control 出现与开合，onChange(isOpen) 在状态翻转及初始同步时回调。
 * Discourse 启动早期可能还没挂载 #reply-control，先用一次性 observer 等它出现再接臂。
 */
export function watchReplyControl(onChange) {
  const start = () => {
    const rc = document.querySelector("#reply-control");
    if (!rc) return false;
    let open = isComposerOpen();
    let full = !!rc.classList.contains("fullscreen");
    new MutationObserver(() => {
      const next = isComposerOpen();
      // 全屏切换不改变 isComposerOpen，但要触发几何重校准（嵌入态全屏=铺满右侧聊天区）
      const nextFull = !!rc.classList.contains("fullscreen");
      if (next !== open || nextFull !== full) {
        open = next;
        full = nextFull;
        onChange(next);
      }
    }).observe(rc, { attributes: true, attributeFilter: ["class"] });
    onChange(open);
    return true;
  };
  if (start()) return;
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", () => { if (!start()) watchReplyControl(onChange); }, { once: true });
    return;
  }
  const boot = new MutationObserver(() => {
    if (start()) boot.disconnect();
  });
  boot.observe(document.body, { childList: true, subtree: true });
}
