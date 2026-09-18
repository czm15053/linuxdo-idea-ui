// 原生 composer 桥：#reply-control 开合与节点替换的持续盯防。
// 只读不写：不搬 Ember DOM（Glimmer 自管渲染），状态同步交由 index.js 切类名。
import { isComposerOpen } from "../bridge/discourse.js";

/**
 * 监听 #reply-control 出现、开合与节点重建，onChange(isOpen) 在状态翻转或节点替换时回调。
 * 早期 #reply-control 可能还没挂载；用 body subtree 持续盯防（而非绑死首个节点）——
 * Ember 重渲染（如回复校验报错）会重建节点，单节点 observer 会失联，
 * 失联后嵌入态类与几何钉不再维护，编辑器退化为原始样式面板。
 */
export function watchReplyControl(onChange) {
  let open = null;
  let full = null;
  let node = null;
  let scheduled = 0;

  const check = () => {
    scheduled = 0;
    const rc = document.querySelector("#reply-control");
    const next = isComposerOpen();
    const nextFull = !!(rc && rc.classList.contains("fullscreen"));
    // 节点被 Ember 重建但开合状态未变：也要强制走一次 onChange，
    // 让 index.js 重新挂 styleWatch 并重钉几何（applyEmbedState 幂等，代价为零）
    const replaced = rc !== node;
    if (next !== open || nextFull !== full || replaced) {
      open = next;
      full = nextFull;
      node = rc;
      onChange(next);
    }
  };

  // rAF 合帧：body subtree 的 class/style 变更非常频繁，check 本身只有两次选择器查询
  const schedule = () => {
    if (scheduled) return;
    scheduled = requestAnimationFrame(check);
  };

  if (document.body) {
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
    check();
    return;
  }
  document.addEventListener("DOMContentLoaded", () => {
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
    check();
  }, { once: true });
}
