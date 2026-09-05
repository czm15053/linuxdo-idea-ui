// 聊天面板反向依赖注册表：chat-panel（先迁）调用 composer/features（后迁）的入口。
// 各域模块迁移完成后改为模块内自注册，app.js 仅负责装配。
export const chatHooks = {
  wireComposer: null,        // composer：编辑器接线
  replyToPost: null,         // composer：回复某楼
  toast: null,               // features：轻提示
  toggleLike: null,          // features：点赞
  openImageModal: null,      // features：沉浸灯箱
  openBoostComposer: null,   // features：小火箭输入条
  deleteBoost: null,         // features：删除小火箭
  renderBoosts: null,        // features：小火箭胶囊 html
  cantUndoText: null,        // features：原生「无法撤销」文案
  pushQuoteJump: null,       // features：引用跳转压栈
  clearQuoteJumpHistory: null, // features：清空返回堆栈
  popQuoteJump: null,        // features：返回原处
  jumpToPost: null,          // chat-panel：话题已打开时滚动/高亮某楼（列表行重复点击用）
  refreshMaskedChrome: null, // chat-panel：匿名伪装开关切换后重涂详情页头部标题/头像
  enhancePolls: null,        // features：投票组件增强
  ensureAiSummaryButton: null, // features：聊天头「AI 总结」按钮
  syncAiSummary: null,       // features：主贴下重插/恢复总结气泡
  startAiSummary: null       // features：触发总结（订阅 MessageBus + POST）
};
