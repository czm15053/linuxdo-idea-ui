// 论坛水回复过滤与折叠引擎
// 移植自 Linux.do 社区安全加固方案，支持双层漏斗过滤（短回复 + 关键词拦截）与文本安全清洗

import { SPAM_FILTER_KEY } from "../config/constants.js";

export const DEFAULT_SHORT_KEYWORDS = [
  "谢", "mark", "cy", "bd", "dd", "顶", "赞", "支持", "好贴", "学习", "666", "牛", "强", "收藏"
];

export const DEFAULT_KEYWORDS = [
  "感谢", "感谢大佬", "感谢分享", "谢谢", "谢谢大佬", "谢谢分享",
  "顶", "插眼", "mark", "Mark", "MARK", "cy", "CY", "bd", "BD",
  "战略性mark", "mark.", "L", "l", "dd", "DD", "支持", "好贴", "666",
  "学习", "学习了", "学到了", "牛逼", "牛蛙", "厉害", "强", "太强了",
  "收藏", "先马", "马住", "前排撸猫",
  "感谢大佬!", "感谢佬友分享", "学习一下", "学习一下~", "感谢大佬分享", "感谢大佬分享！",
  "顶顶", "顶顶顶", "d", "D", "ddd", "DDD"
];

export const DEFAULT_SPAM_CONFIG = {
  enabled: true,
  enableShortReply: true,
  shortReplyThreshold: 12,
  requireShortKeyword: true,
  shortKeywords: DEFAULT_SHORT_KEYWORDS,
  enableKeywordBlock: true,
  keywordMatchMode: "exact", // 'exact' | 'contains'
  keywords: DEFAULT_KEYWORDS
};

/** 验证并规整配置，防止异常数据 */
export function validateSpamConfig(config) {
  if (!config || typeof config !== "object") return { ...DEFAULT_SPAM_CONFIG };
  const valid = { ...DEFAULT_SPAM_CONFIG };

  valid.enabled = typeof config.enabled === "boolean" ? config.enabled : true;
  valid.enableShortReply = typeof config.enableShortReply === "boolean" ? config.enableShortReply : true;
  valid.requireShortKeyword = typeof config.requireShortKeyword === "boolean" ? config.requireShortKeyword : true;
  valid.enableKeywordBlock = typeof config.enableKeywordBlock === "boolean" ? config.enableKeywordBlock : true;

  const threshold = parseInt(config.shortReplyThreshold, 10);
  valid.shortReplyThreshold = isNaN(threshold) || threshold < 1 || threshold > 30 ? 12 : threshold;

  valid.keywordMatchMode = config.keywordMatchMode === "contains" ? "contains" : "exact";

  if (Array.isArray(config.shortKeywords)) {
    valid.shortKeywords = config.shortKeywords
      .filter((k) => typeof k === "string" && k.trim().length > 0)
      .slice(0, 500)
      .map((k) => k.trim().substring(0, 40));
  }
  if (Array.isArray(config.keywords)) {
    valid.keywords = config.keywords
      .filter((k) => typeof k === "string" && k.trim().length > 0)
      .slice(0, 500)
      .map((k) => k.trim().substring(0, 40));
  }

  return valid;
}

let activeConfig = null;

export function loadSpamConfig() {
  if (activeConfig) return activeConfig;
  try {
    const raw = localStorage.getItem(SPAM_FILTER_KEY);
    if (raw) {
      activeConfig = validateSpamConfig(JSON.parse(raw));
      return activeConfig;
    }
  } catch { /* ignore */ }
  activeConfig = { ...DEFAULT_SPAM_CONFIG };
  return activeConfig;
}

const listeners = new Set();
export function onSpamFilterChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function saveSpamConfig(config) {
  activeConfig = validateSpamConfig(config);
  try {
    localStorage.setItem(SPAM_FILTER_KEY, JSON.stringify(activeConfig));
  } catch { /* ignore */ }
  for (const fn of listeners) {
    try { fn(activeConfig); } catch { /* ignore */ }
  }
}

export function resetSpamConfig() {
  saveSpamConfig(DEFAULT_SPAM_CONFIG);
  return activeConfig;
}

/** 清理预览文本，防御 RTL/零宽/控制符溢出攻击 */
/* eslint-disable no-control-regex */
export function sanitizePreview(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .trim()
    .substring(0, 30)
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/[\uFFF0-\uFFFF]/g, "")
    .replace(/[\u0300-\u036F]{3,}/g, "");
}
/* eslint-enable no-control-regex */

/** 提取 HTML 纯文本 */
function extractPlainText(html) {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").trim();
  } catch {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
}

/** 豁免检测：检查帖子是否包含应无条件放行的特征（如引用、投票、图片、代码） */
function isExemptPost(post) {
  if (!post) return true;
  // 1 楼主贴直接放行
  if (Number(post.post_number) === 1) return true;

  const cooked = post.cooked || "";
  // 包含引用块
  if (/<aside\b[^>]*\bclass=["'][^"']*\bquote\b/i.test(cooked) || /<blockquote\b/i.test(cooked)) {
    return true;
  }
  // 包含投票
  if (/\bpoll\b/i.test(cooked) || /data-poll-/i.test(cooked)) {
    return true;
  }
  // 包含代码块
  if (/<pre\b/i.test(cooked) || /<code\b/i.test(cooked)) {
    return true;
  }
  // 包含图片（排除 emoji）
  if (/<img\b(?![^>]*\bclass=["'][^"']*\bemoji\b)[^>]*>/i.test(cooked)) {
    return true;
  }
  return false;
}

/** 用户手动展开的楼层记录（按 post_number 跟踪） */
const expandedPostNumbers = new Set();

export function isPostExpanded(postNumber) {
  return expandedPostNumbers.has(Number(postNumber));
}

export function expandPost(postNumber) {
  expandedPostNumbers.add(Number(postNumber));
}

export function clearExpandedPosts() {
  expandedPostNumbers.clear();
}

/**
 * 判断帖子是否为水贴
 * @param {object} post 楼层数据对象
 * @returns {{ isSpam: boolean, preview?: string }}
 */
export function isSpamPost(post) {
  const config = loadSpamConfig();
  if (!config.enabled) return { isSpam: false };
  if (!post || isExemptPost(post)) return { isSpam: false };

  const rawText = extractPlainText(post.cooked);
  if (!rawText) return { isSpam: false };
  // 超过 1000 字符长回复直接放行
  if (rawText.length > 1000) return { isSpam: false };

  const cleanText = rawText.trim();
  const lowerText = cleanText.toLowerCase();
  const noSpaceText = cleanText.replace(/\s+/g, "").toLowerCase();

  // 1. 短回复漏斗
  if (config.enableShortReply) {
    if (cleanText.length <= config.shortReplyThreshold) {
      if (!config.requireShortKeyword) {
        return { isSpam: true, preview: sanitizePreview(cleanText) };
      }
      for (const kw of config.shortKeywords) {
        if (lowerText.includes(kw.toLowerCase())) {
          return { isSpam: true, preview: sanitizePreview(cleanText) };
        }
      }
    }
  }

  // 2. 关键词漏斗
  if (config.enableKeywordBlock) {
    if (config.keywordMatchMode === "exact") {
      const keywordSet = new Set(config.keywords.map((k) => k.toLowerCase()));
      if (keywordSet.has(lowerText) || keywordSet.has(noSpaceText)) {
        return { isSpam: true, preview: sanitizePreview(cleanText) };
      }
    } else {
      for (const kw of config.keywords) {
        if (lowerText.includes(kw.toLowerCase())) {
          return { isSpam: true, preview: sanitizePreview(cleanText) };
        }
      }
    }
  }

  return { isSpam: false };
}
