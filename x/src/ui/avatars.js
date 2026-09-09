import { isMaskAvatar, isMaskTitle } from "../state/prefs.js";
import { currentSkinId } from "../config/skins.js";
import { PINNED } from "../config/constants.js";
import { escapeHtml, hashStr } from "../utils/html.js";
import { PIN_AVATARS, CHAT_ICONS } from "./feishu-icons.js";

const PALETTE = ["#1A87FF", "#2F88FF", "#F3A23A", "#8B6CFF", "#00C56C", "#FF9F0A", "#5B4BFF", "#EF4444"];
const SURNAMES = ["赵","钱","孙","李","周","吴","郑","王","冯","陈","褚","卫","蒋","沈","韩","杨","朱","秦","尤","许","何","吕","施","张","孔","曹","严","华","金","魏","陶","姜"];
const MASK_GRID_BLUES = ["#0A6FE0", "#1A87FF", "#2F88FF", "#3B92FF", "#4B7CFF", "#5B8FFF", "#6BA0FF", "#7CB1FF", "#8DC2FF"];
const MASK_WORK_ORGS = ["产品", "研发", "前端", "后端", "客户端", "测试", "QA", "运维", "架构", "中台", "数据", "平台"];
const MASK_WORK_OBJS = ["需求", "接口", "契约", "用例", "缺陷", "分支", "版本", "变更", "工单", "告警", "故障", "发布"];
const MASK_WORK_ACTS = ["评审群", "联调群", "值班群", "提测群", "发布群", "复盘群", "迭代群", "排期群", "需求池", "对齐会", "跟进群", "项目组"];
const MASK_WORK_TITLES = [
  "需求评审排期", "技术方案讨论", "接口联调对齐", "代码评审意见", "主干合并冲突",
  "发版窗口确认", "灰度比例调整", "回归范围确认", "提测准入检查", "缺陷定级讨论",
  "线上告警跟进", "监控大盘调整", "值班交接记录", "故障复盘纪要", "降级预案演练",
  "容量水位评估", "慢查询治理", "配置变更同步", "依赖版本升级", "循环依赖治理",
  "单测覆盖率达标", "Mock 数据联调", "冒烟用例执行", "压测结果同步", "埋点方案评审",
  "SDK 版本对齐", "网关路由变更", "缓存命中率排查", "队列积压处理", "日志脱敏改造",
];

export function avatarColor(name) {
  return PALETTE[hashStr(name) % PALETTE.length];
}
export function avatarLetter(name) {
  const s = String(name || "?").trim();
  const ch = [...s][0] || "?";
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
}
export function disguiseTitle(seed) {
  const tid = hashStr(seed);
  const n = (tid * 2654435761) >>> 0;
  if ((n % 2) === 0) {
    const org = MASK_WORK_ORGS[n % MASK_WORK_ORGS.length];
    const obj = MASK_WORK_OBJS[(n >>> 3) % MASK_WORK_OBJS.length];
    const act = MASK_WORK_ACTS[(n >>> 7) % MASK_WORK_ACTS.length];
    const mode = (n >>> 11) % 3;
    if (mode === 0) return `${org}${obj}${act}`;
    if (mode === 1) return `${org}·${obj}${act}`;
    return `【${org}】${obj}${act}`;
  }
  return MASK_WORK_TITLES[n % MASK_WORK_TITLES.length];
}
export function displayTitle(id, real) {
  return isMaskTitle() ? disguiseTitle(id) : real;
}
/** 飞书文字头像精髓：从伪装标题稳定取 3~5 字；四字排两行（模仿真实飞书） */
function feishuText(key) {
  const title = disguiseTitle(key);
  const cleaned = [...String(title || "?")].filter((c) => !/[\s#【】《》*·.,，。!！?？\-_/\\]/.test(c));
  const src = cleaned.length ? cleaned : ["?"];
  let h = 0;
  for (const ch of src) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const n = Math.min(src.length, Math.abs(h) % 3 + 3); // 3 / 4 / 5
  const text = src.slice(0, n).join("");
  if (/^[a-zA-Z0-9]+$/.test(text)) return text.toUpperCase();
  return text;
}

function fsIconHtml(cls, icon, bg = "transparent") {
  return `<span class="${cls} is-fs-icon" style="background:${bg}"><img src="${icon}" alt="" loading="lazy"></span>`;
}

function feishuTextHtml(cls, key, hollow) {
  const text = feishuText(key);
  const chars = [...text];
  const len = chars.length;
  const color = avatarColor(key);
  const label = len === 4
    ? `${escapeHtml(chars[0] + chars[1])}<br>${escapeHtml(chars[2] + chars[3])}`
    : escapeHtml(text);
  const inner = `<span class="im-avatar-text" data-len="${len}">${label}</span>`;
  if (hollow) {
    return `<span class="${cls} is-text-avatar is-hollow" style="background:#fff;color:${color};border:1.5px solid ${color}">${inner}</span>`;
  }
  return `<span class="${cls} is-text-avatar is-solid" style="background:${color};border:1.5px solid ${color}">${inner}</span>`;
}

function seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = seed >>> 0 || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = Math.imul(s ^ (s >>> 16), 0x7feb352d) >>> 0;
    s = (Math.imul(s ^ (s >>> 15), 0x846ca68b) >>> 0) || 1;
    const j = s % (i + 1);
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

// 列表头像类型打散：约 1/4 彩图、1/4 群标、1/2 文字，稳定但不扎堆在顶部
const LIST_MASK_IDS = PINNED.map((p) => p.id).concat(Array.from({ length: 16 }, (_, i) => "fake:" + i));
const LIST_MASK_MODES = seededShuffle(LIST_MASK_IDS.map((_, i) => i % 4), 0x5f3759df);

function feishuMaskMode(key) {
  const idx = LIST_MASK_IDS.indexOf(String(key));
  if (idx >= 0) return LIST_MASK_MODES[idx];
  const n = hashStr(key) >>> 0;
  return (Math.imul(n ^ (n >>> 16), 0x9e3779b9) >>> 0) % 4;
}

/** 伪装头像（三皮肤统一）：飞书文字色块+原生群图标（3~5字/四字两行/实心空心混用，约半数是图标）· 钉钉企微姓氏色块或九宫格；非 mask 回退真图/首字 */
function solidMaskHtml(cls, name, seed) {
  const key = seed || name || "";
  const n = hashStr(key);
  if (currentSkinId() === "feishu") {
    const mode = feishuMaskMode(key);
    const tid = n >>> 0;
    if (mode === 0) return fsIconHtml(cls, CHAT_ICONS[Math.abs(tid * 31) % CHAT_ICONS.length]);
    if (mode === 1) return fsIconHtml(cls, PIN_AVATARS[tid % PIN_AVATARS.length]);
    return feishuTextHtml(cls, key, mode === 3);
  }
  if (n % 2 === 0) {
    const cells = [];
    for (let i = 0; i < 9; i++) {
      const ch = SURNAMES[(n + i * 17) % SURNAMES.length];
      const color = MASK_GRID_BLUES[(n + i) % MASK_GRID_BLUES.length];
      cells.push(`<span style="background:${color}">${escapeHtml(ch)}</span>`);
    }
    return `<span class="${cls} is-grid-mask">${cells.join("")}</span>`;
  }
  const ch = SURNAMES[n % SURNAMES.length];
  return `<span class="${cls} is-text-avatar is-solid" style="background:${avatarColor(ch + key)}"><span class="im-avatar-text" data-len="1">${escapeHtml(ch)}</span></span>`;
}

/** 飞书默认头像：无真实头像时用原生分类/群图标（真实飞书占位头像同风格，外观更真） */
function feishuDefaultIconHtml(cls, key) {
  const i = hashStr(key || "?");
  const icon = i % 3 === 0 ? PIN_AVATARS[i % PIN_AVATARS.length] : CHAT_ICONS[(i * 31) % CHAT_ICONS.length];
  return `<span class="${cls} is-fs-icon" style="background:#EFF3FB"><img src="${icon}" alt=""></span>`;
}

/** 通用人像头像：mask 时统一伪装，否则真图；飞书无头像用默认图标，其余皮肤首字色块
 *  @param {boolean} [forceReal] 壳层身份（rail 左上角等）恒用真头像，不受匿名开关控制 */
export function personAvatarHtml(cls, name, src, seed, forceReal) {
  if (!forceReal && isMaskAvatar()) return solidMaskHtml(cls, name, seed || name);
  if (src) return `<span class="${cls}"><img src="${escapeHtml(upgradeAvatar(src))}" alt=""></span>`;
  // 无真实头像：统一首字色块兜底（不放飞书 logo；张数少的推文缺失头像一般只是提取没拿到，色块更接近 IM 观感）
  return `<span class="${cls} is-text-avatar is-solid" style="background:${avatarColor(seed || name)}"><span class="im-avatar-text" data-len="1">${escapeHtml(avatarLetter(seed || name))}</span></span>`;
}

/** 钉钉/企微群头像：时间线真人头像拼 3×3 */
export function groupAvatarHtml(cls, srcs) {
  const pics = (srcs || []).filter(Boolean);
  if (!pics.length) return "";
  if (pics.length === 1) {
    return `<span class="${cls}"><img src="${escapeHtml(upgradeAvatar(pics[0]))}" alt=""></span>`;
  }
  const cells = [];
  for (let i = 0; i < 9; i++) {
    cells.push(`<img src="${escapeHtml(upgradeAvatar(pics[i % pics.length]))}" alt="">`);
  }
  return `<span class="${cls} is-group">${cells.join("")}</span>`;
}

/** @param {boolean} [forceMask] 消息列表等伪装层恒用假头像，不受匿名开关控制；传入头像数组则拼群头像（飞书忽略，仍用默认图标/文字） */
export function convAvatarHtml(id, name, src, forceMask) {
  if (Array.isArray(src) && src.length && currentSkinId() !== "feishu") return groupAvatarHtml("im-conv-avatar", src);
  if (isMaskAvatar() || forceMask) return solidMaskHtml("im-conv-avatar", name, id);
  if (src) return `<span class="im-conv-avatar"><img src="${escapeHtml(upgradeAvatar(src))}" alt=""></span>`;
  if (currentSkinId() === "feishu") return feishuDefaultIconHtml("im-conv-avatar", id || name);
  return `<span class="im-conv-avatar is-text-avatar is-solid" style="background:${avatarColor(name)}"><span class="im-avatar-text" data-len="1">${escapeHtml(avatarLetter(name))}</span></span>`;
}

export function upgradeAvatar(src) {
  return String(src || "").replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2").replace(/_mini(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
}
