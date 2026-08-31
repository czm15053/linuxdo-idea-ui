let cachedUsername = null;


export function normalizeUsername(name) {
  return (name || "").trim().replace(/^@/, "").toLowerCase();
}
export function extractUsernameFromHref(href) {
  if (!href) return null;
  try {
    const path = href.startsWith("http") ? new URL(href, location.origin).pathname : href;
    const m = path.match(/^\/u\/([^/?#]+)/i);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}
export function readPreloadedCurrentUser() {
  try {
    const el = document.getElementById("data-preloaded");
    if (!el) return null;
    const raw = el.getAttribute("data-preloaded") || el.textContent;
    if (!raw) return null;
    const data = JSON.parse(raw);
    const candidates = [data.currentUser, data.current_user];
    for (const key of Object.keys(data || {})) {
      if (/current.?user/i.test(key)) candidates.push(data[key]);
    }
    for (const c of candidates) {
      if (!c) continue;
      const parsed = typeof c === "string" ? JSON.parse(c) : c;
      const name = parsed && (parsed.username || parsed.user?.username);
      if (name) return name;
    }
  } catch { /* ignore */ }
  return null;
}
export function getCurrentUsername() {
  if (cachedUsername) return cachedUsername;
  try {
    const selectors = [
      "#current-user a[href*='/u/']",
      "#current-user button[data-user-card]",
      "#current-user [data-user-card]",
      "button.icon.btn-flat[data-user-card]",
      ".header-dropdown-toggle.current-user a[href*='/u/']",
      ".current-user a[href*='/u/']"
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const fromHref = extractUsernameFromHref(el.getAttribute("href") || "");
      if (fromHref) {
        cachedUsername = fromHref;
        return cachedUsername;
      }
      const card = el.getAttribute("data-user-card");
      if (card) {
        cachedUsername = card;
        return cachedUsername;
      }
    }

    const img = document.querySelector("#current-user img[alt], .current-user img[alt]");
    if (img && img.alt && !/avatar|头像/i.test(img.alt)) {
      cachedUsername = img.alt.trim();
      return cachedUsername;
    }

    const preloaded = readPreloadedCurrentUser();
    if (preloaded) {
      cachedUsername = preloaded;
      return cachedUsername;
    }

    // Ember 容器兜底
    try {
      const owner =
        window.Discourse?.__container__ ||
        document.querySelector(".ember-application")?.__ember_meta__?.owner;
      const user = owner?.lookup?.("service:current-user") ||
        window.Discourse?.User?.current?.();
      const name = user?.username || user?.get?.("username");
      if (name) {
        cachedUsername = name;
        return cachedUsername;
      }
    } catch { /* ignore */ }
  } catch { /* ignore */ }
  return null;
}
export function isMyPost(post, myName) {
  if (!post) return false;
  if (post.yours === true || post.yours === "true") return true;
  if (post.mine === true || post.is_my_post === true) return true;
  const me = normalizeUsername(myName || getCurrentUsername());
  if (!me) return false;
  return normalizeUsername(post.username) === me;
}
