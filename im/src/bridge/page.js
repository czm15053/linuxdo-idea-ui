// 页面上下文 window 引用。
// meta 声明 GM_xmlhttpRequest 后脚本运行在扩展沙箱，页面变量
// （Discourse / MessageBus / I18n / Ember / require）只在 unsafeWindow 上可见；
// 未声明 grant（@grant none，页面上下文）时 unsafeWindow 不存在，回退 window 自身。
export const pg = globalThis.unsafeWindow || window;
