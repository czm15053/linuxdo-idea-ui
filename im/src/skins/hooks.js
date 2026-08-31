// 皮肤钩子注册表：skins/* 加载时注册，ui/core 运行时调用（避免 ui → skins 反向依赖）
export const skinHooks = {
  renderPins: null,        // () => void          列表置顶区（飞书）
  convAvatar: null,        // (topic) => html|null 会话头像（飞书彩色图标）
  disguiseAvatar: null,    // (topic) => {html,bg,className,styleExtra} 伪装头像（飞书）
  syncChatTabs: null,      // (data, topicId) => void 聊天头分类 chip（飞书）
  darkToggle: null,        // (mount?) => void    深色切换按钮挂载（按皮肤分派）
  msgAvatar: null,         // (seedName) => {html,bg,className,styleExtra}|null  聊天区伪装头像（气泡/聊天头）
};
