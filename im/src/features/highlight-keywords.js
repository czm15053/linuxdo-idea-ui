// 中栏列表常驻关键词高亮引擎
import { HIGHLIGHT_KEY } from "../config/constants.js";
import { escapeHtml } from "../utils/html.js";

export const DEFAULT_HIGHLIGHT_CONFIG = {
  enabled: true,
  keywords: []
};

/** 验证并规整配置 */
export function validateHighlightConfig(config) {
  if (!config || typeof config !== "object") return { ...DEFAULT_HIGHLIGHT_CONFIG };
  const valid = { ...DEFAULT_HIGHLIGHT_CONFIG };

  valid.enabled = typeof config.enabled === "boolean" ? config.enabled : true;

  if (Array.isArray(config.keywords)) {
    valid.keywords = config.keywords
      .filter((k) => typeof k === "string" && k.trim().length > 0)
      .slice(0, 500)
      .map((k) => k.trim().substring(0, 40));
  } else {
    valid.keywords = [];
  }

  return valid;
}

let activeConfig = null;

export function loadHighlightConfig() {
  if (activeConfig) return activeConfig;
  try {
    const raw = localStorage.getItem(HIGHLIGHT_KEY);
    if (raw) {
      activeConfig = validateHighlightConfig(JSON.parse(raw));
      return activeConfig;
    }
  } catch { /* ignore */ }
  activeConfig = { ...DEFAULT_HIGHLIGHT_CONFIG };
  return activeConfig;
}

const listeners = new Set();
export function onHighlightConfigChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function saveHighlightConfig(config) {
  activeConfig = validateHighlightConfig(config);
  try {
    localStorage.setItem(HIGHLIGHT_KEY, JSON.stringify(activeConfig));
  } catch { /* ignore */ }
  for (const fn of listeners) {
    try { fn(activeConfig); } catch { /* ignore */ }
  }
}

/** 正则特殊字符转义 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 缓存当前正则，避免列表渲染时每一行重复编译 */
let cachedPattern = null;
let cachedKeywordsSig = null;

function getSearchRegex(keywords) {
  const sig = keywords.join("\0");
  if (cachedKeywordsSig === sig && cachedPattern !== null) {
    return cachedPattern;
  }
  cachedKeywordsSig = sig;
  if (!keywords.length) {
    cachedPattern = null;
    return null;
  }
  // 按长度从大到小排序，避免较短子串抢先匹配破坏长词
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = sorted.map(escapeRegExp).filter(Boolean).join("|");
  cachedPattern = pattern ? new RegExp(pattern, "gi") : null;
  return cachedPattern;
}

/**
 * 判断标题是否命中了任何高亮关键词
 */
export function hasHighlightedKeyword(text) {
  if (!text || typeof text !== "string") return false;
  const cfg = loadHighlightConfig();
  if (!cfg.enabled || !cfg.keywords.length) return false;
  const regex = getSearchRegex(cfg.keywords);
  if (!regex) return false;
  regex.lastIndex = 0;
  return regex.test(text);
}

/**
 * 对标题文本进行安全转义并对关键词包裹高亮标签 <mark class="im-list-hl">...</mark>
 * @param {string} text 原始标题纯文本
 * @returns {string} 包含高亮 mark 的安全 HTML 片段
 */
export function highlightTitleText(text) {
  if (!text || typeof text !== "string") return "";
  const cfg = loadHighlightConfig();
  if (!cfg.enabled || !cfg.keywords.length) {
    return escapeHtml(text);
  }

  const regex = getSearchRegex(cfg.keywords);
  if (!regex) return escapeHtml(text);

  // 安全匹配：在匹配前先将匹配项与非匹配项分片转义
  let lastIndex = 0;
  let match;
  regex.lastIndex = 0;
  const parts = [];

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    }
    parts.push(`<mark class="im-list-hl">${escapeHtml(match[0])}</mark>`);
    lastIndex = regex.lastIndex;
    // 避免 0 宽死循环
    if (match.index === regex.lastIndex) regex.lastIndex++;
  }

  if (lastIndex < text.length) {
    parts.push(escapeHtml(text.slice(lastIndex)));
  }

  return parts.join("");
}
