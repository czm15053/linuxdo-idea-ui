import { ICONS } from "../config/icons.js";
import { PINNED } from "../config/constants.js";
import { currentSkinId, SKINS } from "../config/skins.js";
import { isMaskAvatar, isMaskTitle, setMaskAvatar, setMaskTitle, getChatId, setChatId, isHideMedia, setHideMedia } from "../state/prefs.js";
import { escapeHtml, stripText } from "../utils/html.js";
import { convAvatarHtml, displayTitle, disguiseTitle } from "./avatars.js";
import { clickHomeTab, navigateX, nativeProfilePath, refreshHomeFeed } from "../bridge/x-dom.js";
import { chatIdFromRoute, routeKind } from "../bridge/router.js";
import { resetChatMessages } from "./chat-panel.js";
import { ensureRail } from "./rail.js";
import { ensureTitlebar } from "./titlebar.js";
import { toast } from "./toast.js";

let filterUnread = false;

export function ensureListPanel() {
  let panel = document.querySelector(".im-list-panel");
  if (!panel) {
    panel = document.createElement("section");
    panel.className = "im-list-panel";
    (document.body || document.documentElement).appendChild(panel);
    panel.addEventListener("click", onListClick);
  }
  renderListHeader(panel);
  renderListBody(panel);
  return panel;
}

function renderListHeader(panel) {
  const skin = SKINS[currentSkinId()];
  let head = panel.querySelector(".im-list-header");
  if (!head) {
    head = document.createElement("div");
    head.className = "im-list-header";
    panel.appendChild(head);
  }
  const titleOrChips = `<div class="im-list-chips">
      <button type="button" class="im-chip${filterUnread ? "" : " active"}" data-chip="all">消息</button>
      <button type="button" class="im-chip${filterUnread ? " active" : ""}" data-chip="unread">未读</button>
    </div>`;
  const html = `
    ${titleOrChips}
    <div class="im-list-actions">
      <button type="button" class="im-icon-btn im-mask-anon-toggle${isMaskAvatar() && isMaskTitle() ? " is-on" : ""}" data-act="mask-anon" title="匿名模式：一键开关头像与标题伪装">${ICONS.disguise}</button>
      <button type="button" class="im-icon-btn im-mask-avatar-toggle${isMaskAvatar() ? " is-on" : ""}" data-act="mask-ava" title="伪装头像">${ICONS.eyes}</button>
      <button type="button" class="im-icon-btn im-mask-title-toggle${isMaskTitle() ? " is-on" : ""}" data-act="mask-title" title="伪装标题">${ICONS.win}</button>
      <button type="button" class="im-icon-btn im-hide-media-toggle${isHideMedia() ? " is-on" : ""}" data-act="hide-media" title="${isHideMedia() ? "显示媒体（图片/视频）" : "隐藏媒体：纯文本摸鱼模式"}">${isHideMedia() ? ICONS.imageOff : ICONS.image}</button>
      <button type="button" class="im-icon-btn xim-skin-btn" title="切换外观">${ICONS.swap}</button>
    </div>`;
  void skin;
  if (head.dataset.sig === html) return;
  head.dataset.sig = html;
  head.innerHTML = html;
}

/* —— 假会话填充：PINNED 之下的占位群聊/单聊，点击标记已读不跳转 —— */
const FAKE_TEMPLATES = [
  ["产品需求评审", "李磊：OK，我这边明天出初稿。"],
  ["前端样式对齐", "王芳：收到，已同步测试同学。"],
  ["线上问题排查", "张伟：问题已定位，等修复上线。"],
  ["早会纪要", "系统：3 条新消息已折叠"],
  ["排期表同步", "赵敏：[链接] 排期表 v2.3"],
  ["灰度发布值班", "陈静：@所有人 下午三点对齐"],
  ["回归范围确认", "刘洋：灰度比例先调到 10%"],
  ["设计走查", "孙悦：图片 2 张"],
  ["踩坑备忘录", "周杰：这个坑我踩过，别走老路"],
  ["文档更新中心", "吴迪：文档已更新"],
  ["发版窗口确认", "郑爽：明天发版窗口确认一下"],
  ["故障复盘", "冯刚：告警已恢复，复盘跟进中"],
  ["方案选型", "何娟：方案 B 整体成本更低"],
  ["测试用例补充", "罗强：测试用例已补完，可回归"],
  ["Merge 合并", "林琳：PR 已合并，主干绿了"],
  ["需求回溯", "许峰：回溯会安排在下周一"],
];
const FAKE_UNREAD = [3, 0, 5, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0];
const FAKE_TIMES = ["09:32", "昨天", "昨天", "周一", "上周", "09:12", "08:45", "周日", "周六", "周五", "周四", "周三", "周二", "10:03", "周一", "上周五"];

function fakeRows(active) {
  const out = [];
  for (let i = 0; i < FAKE_TEMPLATES.length; i++) {
    const [nm, prev] = FAKE_TEMPLATES[i];
    const unread = FAKE_UNREAD[i];
    if (filterUnread && !unread) continue;
    const id = "fake:" + i;
    out.push(convRow({
      id,
      href: "#",
      name: isMaskTitle() ? disguiseTitle("fake:" + i) : nm,
      preview: prev,
      time: FAKE_TIMES[i],
      unread,
      tag: "",
      avatar: "",
      active: id === active,
      pinned: false,
    }));
  }
  return out;
}

function renderListBody(panel) {
  let body = panel.querySelector(".im-list-body");
  if (!body) {
    body = document.createElement("div");
    body.className = "im-list-body";
    panel.appendChild(body);
  }
  const active = getChatId() || chatIdFromRoute();
  const rows = [];
  {
    // 顶部固定项目：推荐流、关注动态、通知中心、个人主页
    for (const p of PINNED) {
      const name = displayTitle("pin:" + p.id, p.name);
      rows.push(convRow({
        id: p.id,
        href: p.path,
        name,
        preview: p.preview,
        time: p.id === active ? "现在" : "",
        unread: 0,
        tag: isMaskTitle() ? "" : p.tag,
        avatar: "",
        pinned: true,
        active: p.id === active,
      }));
    }
    // 假会话填充（用于工作摸鱼伪装，无外网图片混杂）
    rows.push(...fakeRows(active));
  }
  const html = rows.join("") || `<div class="im-list-status">暂无会话</div>`;
  if (body.dataset.sig === html) return;
  body.dataset.sig = html;
  body.innerHTML = html;
}

function convRow(it) {
  return `<a class="im-conv${it.active ? " active" : ""}" href="${escapeHtml(it.href || "#")}" data-id="${escapeHtml(it.id)}">
    ${convAvatarHtml(it.id, it.name, it.avatar, true)}
    <span class="im-conv-info">
      <span class="im-conv-top">
        <span class="im-conv-name">${escapeHtml(it.name)}</span>
        <span class="im-conv-time">${escapeHtml(it.time || "")}</span>
      </span>
      <span class="im-conv-bottom">
        <span class="im-conv-msg">${escapeHtml(stripText(it.preview))}</span>
        ${it.unread ? `<span class="im-conv-badge">${it.unread > 99 ? "99+" : it.unread}</span>` : ""}
      </span>
    </span>
  </a>`;
}

function onListClick(e) {
  const chip = e.target.closest("[data-chip]");
  if (chip) {
    filterUnread = chip.dataset.chip === "unread";
    ensureListPanel();
    return;
  }
  const act = e.target.closest("[data-act]");
  if (act) {
    const a = act.dataset.act;
    if (a === "mask-anon") {
      const on = !(isMaskAvatar() && isMaskTitle());
      setMaskAvatar(on);
      setMaskTitle(on);
      refreshMaskedChrome();
    } else if (a === "mask-ava") { setMaskAvatar(!isMaskAvatar()); refreshMaskedChrome(); }
    else if (a === "mask-title") { setMaskTitle(!isMaskTitle()); refreshMaskedChrome(); }
    else if (a === "hide-media") {
      const on = !isHideMedia();
      setHideMedia(on);
      document.documentElement.classList.toggle("im-hide-media", on);
      ensureListPanel();
      const chatBtn = document.querySelector(".im-chat-panel .im-hide-media-toggle");
      if (chatBtn) {
        chatBtn.classList.toggle("is-on", on);
        chatBtn.innerHTML = on ? ICONS.imageOff : ICONS.image;
        chatBtn.title = on ? "显示媒体（图片/视频）" : "隐藏媒体：纯文本摸鱼模式";
      }
      toast(on ? "已开启纯文本摸鱼模式（隐藏图片与视频）" : "已恢复显示图片与视频");
    }
    return;
  }
  const conv = e.target.closest(".im-conv");
  if (!conv) return;
  e.preventDefault();
  const id = conv.dataset.id;
  if (id.startsWith("fake:")) {
    const idx = Number(id.slice(5));
    if (Number.isFinite(idx) && FAKE_UNREAD[idx] > 0) {
      FAKE_UNREAD[idx] = 0;
      ensureListPanel();
    }
    return;
  }
  setChatId(id);
  if (id.startsWith("dm:")) {
    navigateX(conv.getAttribute("href") || `/messages/${id.slice(3)}`);
    resetChatMessages();
    return;
  }
  const pin = PINNED.find((p) => p.id === id);
  if (pin) {
    if (pin.id === "profile") {
      const p = nativeProfilePath();
      navigateX(p || pin.path);
    } else if (pin.id === "explore" && routeKind() === "explore") {
      // 已在发现页：再点一次「发现推荐」= 换一批
      refreshHomeFeed();
    } else {
      navigateX(pin.path);
      if (pin.tab) setTimeout(() => clickHomeTab(pin.tab), 400);
    }
    resetChatMessages();
    document.querySelector(".im-feed-col")?.scrollTo(0, 0);
    setTimeout(resetChatMessages, 600);
    setTimeout(resetChatMessages, 1500);
  }
}

/** 匿名开关切换后全局重涂（列表/rail/标题栏/聊天头部/消息头像），对齐 im 版 refreshMaskedChrome */
function refreshMaskedChrome() {
  ensureListPanel();
  ensureRail();
  ensureTitlebar();
  resetChatMessages();
}

export function syncListFromFeed() {
  const panel = document.querySelector(".im-list-panel");
  if (panel) renderListBody(panel);
}
