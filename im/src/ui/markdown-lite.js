// 轻量 Markdown → HTML 渲染子集（快捷输入框实时预览用，输入粒度按「块」渲染）。
// 覆盖 Discourse 常用语法：标题（# 降一级为 h2，同 Discourse）、引用、有序/无序/任务列表、
// 围栏代码、表格、分割线、图片（upload:// 走会话内直链登记 + short-url 重定向兜底）、
// 行内代码/加粗/斜体/删除线/链接/裸链接/@提及/emoji 短码/脚注、日期 chip、模糊剧透；
// 常用 BBCode 块（details/quote/poll）与 $$ 公式块按结构渲染。
// mermaid/chart/graphviz 等围栏块按代码原文展示，不执行渲染。
import { discourseRequire } from "../bridge/discourse.js";

const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const esc = (s) => s.replace(/[&<>"]/g, (c) => ESC_MAP[c]);

/* 会话内上传的 short_url → 直链映射（composer 上传成功后登记，跨块生效） */
const UPLOAD_URLS = new Map();
export function registerUploadUrl(shortUrl, url) {
  if (shortUrl && url) UPLOAD_URLS.set(String(shortUrl), String(url));
}
function resolveImgUrl(url) {
  if (!url.startsWith("upload://")) return url;
  return UPLOAD_URLS.get(url) || `/uploads/short-url/${url.slice("upload://".length)}`;
}

/* emoji 短码 → 图：优先 Discourse pretty-text 的 emojiUrlFor（含别名/肤色），
   其次从页面已渲染的 img.emoji 现学（alt=":name:" → src），都拿不到就保留原文 */
let emojiMod;
const EMOJI_URLS = new Map();
let emojiScanAt = 0;
function emojiUrl(name) {
  if (emojiMod === undefined) {
    emojiMod = discourseRequire("pretty-text/addon/emoji") || discourseRequire("pretty-text/emoji") || null;
  }
  const url = emojiMod?.emojiUrlFor?.(name);
  if (url) return url;
  if (EMOJI_URLS.has(name)) return EMOJI_URLS.get(name);
  const now = Date.now();
  if (now - emojiScanAt > 5000) {
    emojiScanAt = now;
    for (const img of document.querySelectorAll("img.emoji")) {
      const m = (img.getAttribute("alt") || "").match(/^:([a-z0-9_+-]+(?::t[2-6])?):$/i);
      if (m && img.src && !EMOJI_URLS.has(m[1])) EMOJI_URLS.set(m[1], img.src);
    }
  }
  return EMOJI_URLS.get(name) || null;
}

function inlineMd(src) {
  let s = esc(src);
  // 图片必须先于链接：![alt|WxH](url)，alt 内 |WxH 为 Discourse 尺寸标注
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
    const [label, dims] = alt.split("|");
    const [w, h] = String(dims || "").split("x").map((n) => parseInt(n, 10) || 0);
    const size = w > 0 && h > 0 ? ` width="${w}" height="${h}"` : "";
    return `<img class="im-md-img" src="${resolveImgUrl(url)}" alt="${label}"${size}>`;
  });
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/(^|[\s>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
  s = s.replace(/(^|\s)@([a-zA-Z0-9_.-]+)/g, '$1<a class="im-mention" href="/u/$2">@$2</a>');
  // BBCode 行内：模糊剧透 / 日期 chip
  s = s.replace(/\[blur\]([\s\S]*?)\[\/blur\]/g, '<span class="im-md-blur">$1</span>');
  s = s.replace(/\[date=([^\]]+)\]/g, (m, attrs) => {
    const d = attrs.match(/^([\d-]+)/)?.[1] || ""; // 外层正则已吃掉 "date=" 前缀
    const t = attrs.match(/time=([\d:]+)/)?.[1] || "";
    return `<span class="im-md-date">🕐 ${[d, t].filter(Boolean).join(" ") || attrs}</span>`;
  });
  // 脚注引用 [^1] → 上标
  s = s.replace(/\[\^(\d+)\]/g, "<sup>[$1]</sup>");
  // emoji 短码（解析不到保留原文）
  s = s.replace(/:([a-z0-9_+-]+(?::t[2-6])?):/gi, (m, name) => {
    const url = emojiUrl(name);
    return url ? `<img class="emoji" src="${url}" alt=":${name}:" title=":${name}:">` : m;
  });
  return s.replace(/\n/g, "<br>");
}

/* 表格：表头行 + 分隔行（| --- | --- |），支持 :-- / --: 对齐标注 */
function splitRow(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}
function parseTable(lines) {
  if (lines.length < 2 || !lines[0].includes("|")) return null;
  const sepCells = splitRow(lines[1]);
  if (!sepCells.length || !sepCells.every((c) => /^:?-{3,}:?$/.test(c))) return null;
  const aligns = sepCells.map((c) =>
    (c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : c.startsWith(":") ? "left" : ""));
  const row = (cells, tag) =>
    `<tr>${cells.map((c, i) => `<${tag}${aligns[i] ? ` style="text-align:${aligns[i]}"` : ""}>${inlineMd(c)}</${tag}>`).join("")}</tr>`;
  const body = lines.slice(2).filter((l) => l.includes("|")).map((l) => row(splitRow(l), "td")).join("");
  return `<table class="im-md-table"><thead>${row(splitRow(lines[0]), "th")}</thead><tbody>${body}</tbody></table>`;
}

/** 块内嵌套内容（details/quote 内部）：按空行再切块递归渲染 */
function renderInner(src) {
  const text = (src || "").trim();
  if (!text) return "";
  return text.split(/\n{2,}/).map((part) => mdToHtml(part)).join("");
}

/** 渲染单个块（块 = 一段不含空行的原文，可含行内换行） */
export function mdToHtml(src) {
  const lines = src.split("\n");
  // 围栏代码：整块以 ``` 开头按代码渲染（未闭合也按代码处理，打字过程中更直观）
  if (/^\s*```/.test(lines[0])) {
    const body = lines.slice(1).join("\n").replace(/\n?```\s*$/, "");
    return `<pre><code>${esc(body)}</code></pre>`;
  }
  // 分割线
  if (lines.length === 1 && /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(src)) return "<hr>";
  // $$ 公式块：无 KaTeX，按代码样式展示原文
  if (/^\s*\$\$/.test(lines[0])) {
    const body = lines.slice(1).join("\n").replace(/\n?\$\$\s*$/, "");
    return `<pre class="im-md-math"><code>${esc(body)}</code></pre>`;
  }
  // BBCode 块：details / quote / poll（需整块匹配，块内空行会被先行切走，属已知边界）
  const details = src.match(/^\[details(?:="([^"]*)")?\]\s*\n?([\s\S]*?)\n?\[\/details\]\s*$/);
  if (details) {
    return `<details class="im-md-details"><summary>${esc(details[1] || "详细信息")}</summary>${renderInner(details[2])}</details>`;
  }
  const quote = src.match(/^\[quote(?:="([^"]*)")?\]\s*\n?([\s\S]*?)\n?\[\/quote\]\s*$/);
  if (quote) {
    const who = (quote[1] || "").split(",")[0].trim();
    return `<blockquote class="im-md-quote">${who ? `<div class="im-md-quote-head">${esc(who)}：</div>` : ""}${renderInner(quote[2])}</blockquote>`;
  }
  const poll = src.match(/^\[poll[^\]]*\]\s*\n?([\s\S]*?)\n?\[\/poll\]\s*$/);
  if (poll) {
    const opts = poll[1].split("\n").filter((l) => /^- /.test(l))
      .map((l) => `<li>${inlineMd(l.slice(2))}</li>`).join("");
    return `<div class="im-md-poll"><div class="im-md-poll-title">🗳 投票（发送后生效）</div><ul>${opts}</ul></div>`;
  }
  // 表格
  const table = parseTable(lines);
  if (table) return table;
  // 脚注定义块：每行都是 [^N]: 内容
  if (lines.every((l) => /^\[\^\d+\]:/.test(l))) {
    return lines.map((l) => {
      const m = l.match(/^\[\^(\d+)\]:\s*(.*)$/);
      return `<div class="im-md-footnote"><sup>[${m[1]}]</sup> ${inlineMd(m[2])}</div>`;
    }).join("");
  }
  if (lines.every((l) => l.startsWith(">") || !l.trim()) && lines.some((l) => l.startsWith(">"))) {
    return `<blockquote>${lines.map((l) => inlineMd(l.replace(/^> ?/, ""))).join("<br>")}</blockquote>`;
  }
  if (lines.every((l) => /^- /.test(l) || !l.trim()) && lines.some((l) => /^- /.test(l))) {
    return `<ul>${lines.filter((l) => /^- /.test(l)).map((l) => {
      const item = l.slice(2);
      const task = item.match(/^\[( |x|X)\]\s+(.*)$/);
      if (task) {
        return `<li class="im-md-task"><input type="checkbox" disabled${task[1] === " " ? "" : " checked"}> ${inlineMd(task[2])}</li>`;
      }
      return `<li>${inlineMd(item)}</li>`;
    }).join("")}</ul>`;
  }
  if (lines.every((l) => /^\d+\. /.test(l) || !l.trim()) && lines.some((l) => /^\d+\. /.test(l))) {
    return `<ol>${lines.filter((l) => /^\d+\. /.test(l)).map((l) => `<li>${inlineMd(l.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>`;
  }
  const heading = src.match(/^(#{1,4}) (.*)$/s);
  if (heading) {
    const tag = `h${heading[1].length + 1}`; // Discourse 语义：# 渲染为 h2
    return `<${tag}>${inlineMd(heading[2])}</${tag}>`;
  }
  return `<p>${inlineMd(src)}</p>`;
}
