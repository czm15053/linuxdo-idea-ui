
export const listState = {
  apiPath: "",
  moreUrl: null,
  loading: false,
  topics: [],
  usersById: {},
  query: "" // 中栏本地搜索关键字（wecom 搜索框；renderListRows 按标题过滤）
};

export const DEFAULT_LIST_NAV = [
  { href: "/latest", label: "最新" },
  { href: "/new", label: "新" },
  { href: "/unseen", label: "未读" },
  { href: "/hot", label: "热门" },
  { href: "/top", label: "排行榜" },
  { href: "/posted", label: "我的帖子" },
  { href: "/read", label: "已读" },
  { href: "/bookmarks", label: "书签" },
  { href: "/categories", label: "类别" }
];
