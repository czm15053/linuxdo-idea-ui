export const chatState = {
  topicId: null,
  loading: false,
  stream: [],        // 全部 post id 顺序
  renderedFirstIdx: 0, // stream 中已渲染的起始下标
  renderedLastIdx: -1, // stream 中已渲染的结束下标
  renderedLastNumber: 0, // 已渲染的最大 post_number
  totalPosts: 0,     // 话题总楼数（posts_count，选择楼层用）
  hasOlder: false,
  hasNewer: false,
  title: "",
  op: null          // 当前话题 OP 楼（详情头部头像/伪装复用）
};

export const topicPostsMap = new Map(); // post_number -> post data，用于投票/小火箭等组件反查
