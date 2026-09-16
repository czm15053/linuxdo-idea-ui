export function escapeHtml(s) {
  // GraphQL 的计数字段是 number（DOM 抓取是 string）：统一强转，避免 Number.replace 抛异常
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function stripText(s) {
  return String(s == null ? "" : s).replace(/\s+/g, " ").trim();
}

export function hashStr(s) {
  let h = 0;
  const str = String(s || "");
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function parseCountValue(str) {
  if (!str) return 0;
  const s = String(str).trim();
  if (!s) return 0;
  if (s.endsWith("万")) {
    const v = parseFloat(s.slice(0, -1));
    return Number.isNaN(v) ? 0 : Math.round(v * 10000);
  }
  if (/k$/i.test(s)) {
    const v = parseFloat(s.slice(0, -1));
    return Number.isNaN(v) ? 0 : Math.round(v * 1000);
  }
  if (/m$/i.test(s)) {
    const v = parseFloat(s.slice(0, -1));
    return Number.isNaN(v) ? 0 : Math.round(v * 1000000);
  }
  const clean = s.replace(/,/g, "");
  const n = parseInt(clean, 10);
  return Number.isNaN(n) ? 0 : n;
}

export function formatCount(num) {
  if (num === null || num === undefined || num === "") return "";
  const n = typeof num === "number" ? num : parseInt(String(num).replace(/,/g, ""), 10);
  if (Number.isNaN(n) || n <= 0) return "";
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "万";
  if (n >= 1000) return n.toLocaleString("en-US");
  return String(n);
}
