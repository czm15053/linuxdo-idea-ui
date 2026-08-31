import { isMaskAvatar, isMaskTitle } from "./toggles.js";
import { AVATAR_COLORS } from "../../config/skins.js";
import { escapeHtml } from "../../utils/html.js";

export function avatarColor(name) {
  let hash = 0;
  const s = String(name || "?");
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
export function avatarLetter(name) {
  const s = String(name || "?").trim();
  const ch = [...s][0] || "?";
  return /[a-z]/i.test(ch) ? ch.toUpperCase() : ch;
}
/** 优先用户显示名（name），再退回 username */
export function userDisplayName(user, fallback) {
  const name = user && String(user.name || "").trim();
  if (name) return name;
  const uname = user && String(user.username || "").trim();
  if (uname) return uname;
  return String(fallback || "?").trim() || "?";
}


/* ---------- 会话伪装头像（圆角矩形单字） ---------- */


export const SURNAMES = [
  "赵","钱","孙","李","周","吴","郑","王","冯","陈","褚","卫","蒋","沈","韩","杨","朱","秦","尤","许",
  "何","吕","施","张","孔","曹","严","华","金","魏","陶","姜","戚","谢","邹","喻","柏","水","窦","章",
  "云","苏","潘","葛","奚","范","彭","郎","鲁","韦","昌","马","苗","凤","花","方","俞","任","袁","柳",
  "酆","鲍","史","唐","费","廉","岑","薛","雷","贺","倪","汤","滕","殷","罗","毕","郝","邬","安","常",
  "乐","于","时","傅","皮","卞","齐","康","伍","余","元","卜","顾","孟","平","黄","和","穆","萧","尹"
];


export function surnameForTopic(topic) {
  const idx = Math.abs(Number(topic.id) || 0) % SURNAMES.length;
  return SURNAMES[idx];
}
/**
 * 伪装头像：圆角矩形 + 百家姓单字
 * @returns {{ html: string, bg: string, className: string, styleExtra: string }}
 */
export function disguiseAvatarForTopicDingtalk(topic) {
  // 原钉钉行为：约一半话题（id 偶数）用九宫格姓氏头像
  if (isGridMaskTopic(topic)) return disguiseGridAvatar(topic);
  const ch = surnameForTopic(topic);
  const color = avatarColor(ch + String(topic.id || 0));
  return {
    html: `<span class="im-avatar-text" data-len="1">${escapeHtml(ch)}</span>`,
    bg: color,
    className: "is-text-avatar is-solid",
    styleExtra: "color:#fff;"
  };
}


export const MASK_GRID_BLUES = [
  "#0A6FE0", "#1A87FF", "#2F88FF", "#3B92FF", "#4B7CFF",
  "#5B8FFF", "#6BA0FF", "#7CB1FF", "#8DC2FF"
];


/** 九宫格伪装头像：与 disguiseAvatar* 同契约返回对象（外层 .im-conv-avatar 由调用方拼装） */
export function disguiseGridAvatar(topic) {
  const cells = [];
  const seed = Math.abs(Number(topic.id) || 0);
  for (let i = 0; i < 9; i++) {
    const ch = SURNAMES[(seed + i * 17) % SURNAMES.length];
    const color = MASK_GRID_BLUES[(seed + i) % MASK_GRID_BLUES.length];
    cells.push(`<span style="background:${color}">${escapeHtml(ch)}</span>`);
  }
  return {
    html: cells.join(""),
    bg: "transparent",
    className: "is-grid-mask",
    styleExtra: ""
  };
}


/** 匿名模式下伪装成工作会话标题（按 topic.id 稳定取值） */
export const MASK_WORK_ORGS = ["产品", "研发", "前端", "后端", "客户端", "测试", "QA", "运维", "架构", "中台", "数据", "平台"];
export const MASK_WORK_OBJS = ["需求", "接口", "契约", "用例", "缺陷", "分支", "版本", "变更", "工单", "告警", "故障", "发布"];
export const MASK_WORK_ACTS = ["评审群", "联调群", "值班群", "提测群", "发布群", "复盘群", "迭代群", "排期群", "需求池", "对齐会", "跟进群", "项目组"];
export const MASK_WORK_TITLES = [
  "需求评审排期", "技术方案讨论", "接口联调对齐", "代码评审意见", "主干合并冲突",
  "发版窗口确认", "灰度比例调整", "回归范围确认", "提测准入检查", "缺陷定级讨论",
  "线上告警跟进", "监控大盘调整", "值班交接记录", "故障复盘纪要", "降级预案演练",
  "容量水位评估", "慢查询治理", "配置变更同步", "依赖版本升级", "循环依赖治理",
  "单测覆盖率达标", "Mock 数据联调", "冒烟用例执行", "压测结果同步", "埋点方案评审",
  "SDK 版本对齐", "网关路由变更", "缓存命中率排查", "队列积压处理", "日志脱敏改造",
  "数据库迁移演练", "容器资源扩容", "发布回滚演练", "需求验收清单", "接口文档补全",
  "迭代任务盘点", "技术债清理周", "编码规范宣讲", "方案设计评审", "上线检查清单"
];

export function disguiseTitleForTopic(topic) {
  const tid = Math.abs(Number(topic && topic.id) || 0);
  // 打散相邻 id，避免列表里标题连片重复
  const seed = (tid * 2654435761) >>> 0;
  // 约一半用组合群名（更像飞书会话），一半用固定工作标题
  if ((seed % 2) === 0) {
    const org = MASK_WORK_ORGS[seed % MASK_WORK_ORGS.length];
    const obj = MASK_WORK_OBJS[(seed >>> 3) % MASK_WORK_OBJS.length];
    const act = MASK_WORK_ACTS[(seed >>> 7) % MASK_WORK_ACTS.length];
    const mode = (seed >>> 11) % 3;
    if (mode === 0) return `${org}${obj}${act}`;
    if (mode === 1) return `${org}·${obj}${act}`;
    return `【${org}】${obj}${act}`;
  }
  return MASK_WORK_TITLES[seed % MASK_WORK_TITLES.length];
}
export function fullAvatarUrl(template) {
  if (!template) return "";
  const url = template.replace("{size}", "96");
  return url.startsWith("http") ? url : location.origin + url;
}

/** 隐私模式下随机一半话题使用九宫格姓氏头像 */
export function isGridMaskTopic(topic) {
  return isMaskAvatar() && (Math.abs(Number(topic.id) || 0) % 2 === 0);
}
export function convDisplayTitle(topic) {
  return isMaskTitle() ? disguiseTitleForTopic(topic) : String(topic.title || "");
}
export function convDisplaySummary(topic, fallbackSummary) {
  if (isMaskAvatar() || isMaskTitle()) return String(topic.title || fallbackSummary || "");
  return fallbackSummary;
}
