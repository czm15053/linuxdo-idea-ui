import { stripText } from "../utils/html.js";

// 从原生 tool aria-label（如 "1,217 replies"）或子文本解析数字串
function countIn(label) {
  if (!label) return "";
  const m = String(label).replace(/,/g, "").match(/(\d+(?:\.\d+)?[KkM万]?)/);
  return m ? m[1] : "";
}

export function extractStat(btn) {
  if (!btn) return "";
  const label = btn.getAttribute("aria-label") || "";
  const mLabel = countIn(label);
  if (mLabel) return mLabel;
  const txt = (btn.innerText || btn.textContent || "").trim();
  return countIn(txt);
}

// 解析推文操作栏容器 role="group" 的 aria-label（如 "39 回复、7 次转帖、34 喜欢、49 书签、4764 次观看"）
export function parseGroupStats(groupAriaLabel) {
  if (!groupAriaLabel) return {};
  const clean = String(groupAriaLabel).replace(/,/g, "");
  const stats = {};
  const mReply = clean.match(/(\d+(?:\.\d+)?[KkM万]?)\s*(?:个?回复|条回复|次回复|replies|reply)/i);
  if (mReply) stats.reply = mReply[1];
  const mRt = clean.match(/(\d+(?:\.\d+)?[KkM万]?)\s*(?:次转帖|条转帖|次转发|条转发|转帖|转发|reposts|repost|retweets|retweet)/i);
  if (mRt) stats.retweet = mRt[1];
  const mLike = clean.match(/(\d+(?:\.\d+)?[KkM万]?)\s*(?:次喜欢|个喜欢|喜欢|次点赞|个点赞|点赞|likes|like|favorites|favorite)/i);
  if (mLike) stats.like = mLike[1];
  const mBookmark = clean.match(/(\d+(?:\.\d+)?[KkM万]?)\s*(?:次书签|个书签|书签|bookmarks|bookmark)/i);
  if (mBookmark) stats.bookmark = mBookmark[1];
  const mView = clean.match(/(\d+(?:\.\d+)?[KkM万]?)\s*(?:次观看|次查看|次浏览|观看|查看|浏览|views|view)/i);
  if (mView) stats.views = mView[1];
  return stats;
}

let quoteMarkSeq = 0;

export function clickNative(sel) {
  const el = document.querySelector(sel);
  if (el) { el.click(); return true; }
  return false;
}

let cachedMe = { path: "", handle: "", name: "", avatar: "" };
const ME_CACHE_KEY = "x-im:me";

function readCachedMe() {
  try {
    const raw = localStorage.getItem(ME_CACHE_KEY);
    if (raw) return JSON.parse(raw) || {};
  } catch { /* ignore */ }
  return {};
}
function writeCachedMe() {
  try {
    localStorage.setItem(ME_CACHE_KEY, JSON.stringify(cachedMe));
  } catch { /* ignore */ }
}

function bgProfile(el) {
  if (!el) return "";
  const style = `${el.getAttribute("style") || ""} ${el.style?.backgroundImage || ""}`;
  const m = style.match(/https:\/\/pbs\.twimg\.com\/profile_images\/[^"' )\]]+/);
  if (m) return m[0].replace(/&quot;/g, "");
  const nested = el.querySelector?.("[style*='profile_images']");
  if (nested && nested !== el) return bgProfile(nested);
  return "";
}

function imgSrc(el) {
  if (!el) return "";
  const img = el.tagName === "IMG" ? el : el.querySelector("img");
  if (!img) return bgProfile(el);
  const src = img.currentSrc || img.src || img.getAttribute("src") || img.getAttribute("data-src")
    || (img.getAttribute("srcset") || "").split(",")[0]?.trim().split(/\s+/)[0] || "";
  if (src && !src.startsWith("data:")) return src;
  return bgProfile(img) || bgProfile(el);
}

function resolveMe() {
  if (!cachedMe._boot) {
    // 首次加载先用上次缓存兜底（头像 URL / 主页路径长期有效），DOM 就绪后新值会覆盖
    const saved = readCachedMe();
    cachedMe = { path: saved.path || "", handle: saved.handle || "", name: saved.name || "", avatar: saved.avatar || "", _boot: true };
  }
  const profileA = document.querySelector(
    'a[data-testid="AppTabBar_Profile_Link"], a[data-testid="SideNav_ProfileButton_Button"], a[aria-label="Profile"], a[aria-label="个人资料"]'
  );
  const switcher = document.querySelector(
    '[data-testid="SideNav_AccountSwitcher_Button"], [data-testid="DashButton_ProfileIcon_Link"], button[aria-label*="Account menu"], button[aria-label*="账户菜单"]'
  );
  const trusted = profileA
    || switcher?.closest("a")
    || switcher?.querySelector("a")
    || null;
  let path = trusted?.getAttribute("href") || "";
  if (!path) {
    const a = document.querySelector('nav a[href^="/"][aria-label*="profile" i]');
    path = a?.getAttribute("href") || "";
  }
  if (path && path.startsWith("/") && !path.startsWith("/i/") && !path.startsWith("/settings")) {
    const handle = path.replace(/^\//, "").split("/")[0];
    if (handle && /^[a-zA-Z0-9_]{1,20}$/.test(handle)) {
      cachedMe.path = "/" + handle;
      cachedMe.handle = handle;
    }
  }
  const handle = cachedMe.handle;
  // 账户切换按钮 / 个人资料入口里的圆圆像是用户本人，优先级最高
  let avatar = imgSrc(switcher) || imgSrc(profileA)
    || imgSrc(document.querySelector("header[role='banner'] img[src*='profile_images']"))
    || imgSrc(document.querySelector("header[role='banner'] [style*='profile_images']"));
  if (!avatar && handle) {
    avatar = imgSrc(document.querySelector(`[data-testid="UserAvatar-Container-${handle}"]`))
      || imgSrc(document.querySelector(`header[role="banner"] a[href="/${handle}"]`))
      || imgSrc(document.querySelector(`article[data-testid="tweet"] a[href="/${handle}"] img[src*="profile_images"]`))
      || imgSrc(document.querySelector(`a[href="/${handle}"] img[src*="profile_images"]`));
  }
  if (avatar) cachedMe.avatar = avatar;

  let name = (profileA?.getAttribute("aria-label") || "")
    .replace(/Profile|个人资料/gi, "").replace(/[,，].*$/, "").trim();
  if (!name && handle) {
    name = stripText(document.querySelector(`article[data-testid="tweet"] a[href="/${handle}"] [data-testid="User-Name"] span`)?.textContent || "");
  }
  if (!name && switcher) {
    name = (switcher.getAttribute("aria-label") || "").replace(/Account menu|账户菜单|Accounts|menu/gi, "").trim();
  }
  if (name && name !== "我") cachedMe.name = name;
  else if (!cachedMe.name && handle) cachedMe.name = handle;
  if (cachedMe.path) writeCachedMe();
}

export function nativeProfilePath() {
  resolveMe();
  return cachedMe.path;
}

export function nativeAvatarSrc() {
  resolveMe();
  return cachedMe.avatar;
}

export function nativeDisplayName() {
  resolveMe();
  return cachedMe.name || cachedMe.handle || "我";
}

export function badgeCount(href) {
  const a = document.querySelector(`a[href="${href}"]`);
  if (!a) return 0;
  const aria = a.getAttribute("aria-label") || "";
  const m = aria.match(/(\d+)/);
  if (m) return Math.min(99, Number(m[1]));
  const text = (a.textContent || "").replace(/\D/g, "");
  if (text) return Math.min(99, Number(text));
  if (a.querySelector('[data-testid="AppTabBar_Home_Link"]')) return 0;
  const dot = a.querySelector('[aria-label*="unread" i], [aria-label*="未读"]');
  return dot ? 1 : 0;
}

export function currentHomeTab() {
  const on = [...document.querySelectorAll('[role="tab"]')].find((t) => t.getAttribute("aria-selected") === "true");
  const t = on?.textContent || "";
  if (/Following|关注/.test(t)) return "following";
  return "for-you";
}

export function clickHomeTab(tab) {
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const re = tab === "following" ? /Following|关注/ : /For you|推荐|为你/;
  const el = tabs.find((n) => re.test(n.textContent || ""));
  if (el) { el.click(); return true; }
  return false;
}

function dispatchClick(el) {
  if (!el) return;
  const opts = { bubbles: true, cancelable: true, composed: true };
  try { el.dispatchEvent(new PointerEvent("pointerdown", opts)); } catch { /* ignore */ }
  try { el.dispatchEvent(new MouseEvent("mousedown", opts)); } catch { /* ignore */ }
  try { el.dispatchEvent(new PointerEvent("pointerup", opts)); } catch { /* ignore */ }
  try { el.dispatchEvent(new MouseEvent("mouseup", opts)); } catch { /* ignore */ }
  try { el.dispatchEvent(new MouseEvent("click", opts)); } catch { /* ignore */ }
  try { el.click(); } catch { /* ignore */ }
}

/** 驱动 X 关注页原生下拉菜单切换排序（热门 vs 最近） */
export async function switchFollowingSort(targetMode) {
  window.__imSortKeep = true;
  try {
    // 1. 确保处于「正在关注（Following）」Tab
    let tabs = [...document.querySelectorAll('[role="tab"]')];
    let tab = tabs.find((n) => /Following|关注/.test(n.textContent || ""));
    if (!tab) {
      console.warn("[x-im:sort] 未找到关注 Tab");
      return false;
    }

    if (tab.getAttribute("aria-selected") !== "true") {
      dispatchClick(tab);
      await new Promise((r) => setTimeout(r, 400));
      tabs = [...document.querySelectorAll('[role="tab"]')];
      tab = tabs.find((n) => /Following|关注/.test(n.textContent || "")) || tab;
    }

    // 2. 清理遗留菜单，避免命中旧节点
    document.querySelectorAll('[data-testid="Dropdown"], [data-testid="sheetDialog"]').forEach((d) => d.remove());

    // 3. 触发 Tab 内的下拉箭头 SVG（同时向 SVG 及其父级可交互容器派发全套鼠标/指针事件）
    const svgIcon = tab.querySelector("svg");
    const triggerBtn = svgIcon?.closest('[role="button"]') || svgIcon?.parentElement || svgIcon || tab;
    if (svgIcon) dispatchClick(svgIcon);
    if (triggerBtn && triggerBtn !== svgIcon) dispatchClick(triggerBtn);

    // 4. 等待原生下拉菜单渲染（最长 2s）
    const dropdown = await new Promise((resolve) => {
      const getMenu = () => {
        const m = document.querySelector('[data-testid="Dropdown"], [data-testid="sheetDialog"]');
        return m && !m.hidden ? m : null;
      };
      const cur = getMenu();
      if (cur) return resolve(cur);

      const ob = new MutationObserver(() => {
        const m = getMenu();
        if (m) {
          ob.disconnect();
          resolve(m);
        }
      });
      ob.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => {
        ob.disconnect();
        resolve(getMenu());
      }, 2000);
    });

    if (!dropdown) {
      console.warn("[x-im:sort] 未检测到排序下拉菜单挂载");
      return false;
    }

    // 临时隐蔽，避免原生弹层在 IM 伪装层穿帮闪烁
    dropdown.style.opacity = "0";
    dropdown.style.pointerEvents = "none";

    console.info("[x-im:sort] 下拉菜单内容:", (dropdown.innerText || "").replace(/\s+/g, " "));

    // 5. 正则匹配目标选项（兼容中英文 Top/热门 vs Recent/Latest/最新/最近）
    const isHot = targetMode === "hot";
    const re = isHot ? /(?:Top|热门)/i : /(?:Recent|Latest|最新|最近)/i;
    const items = Array.from(dropdown.querySelectorAll('[role="menuitem"], [data-testid="Dropdown"] > div, [data-testid="sheetDialog"] > div, [tabindex="0"], div'));
    const targetEl = items.find((el) => {
      const t = (el.innerText || el.textContent || "").trim();
      return re.test(t) && t.length < 25;
    });

    if (targetEl) {
      console.info(`[x-im:sort] 匹配到项: "${(targetEl.innerText || "").trim()}"，分发点击`);
      dispatchClick(targetEl);
      const inner = targetEl.querySelector('div, button, [role="button"]');
      if (inner && inner !== targetEl) dispatchClick(inner);
      return true;
    }

    console.warn(`[x-im:sort] 未匹配到排序选项: ${targetMode}`);
    return false;
  } catch (err) {
    console.error("[x-im:sort] 切换排序异常:", err);
    return false;
  } finally {
    setTimeout(() => {
      window.__imSortKeep = false;
      document.querySelectorAll('[data-testid="Dropdown"]').forEach((d) => d.remove());
    }, 250);
  }
}

/** 归一化导航路径：绝对→相对、保留关键查询串、去尾部斜杠 */
function normPath(p) {
  const s = String(p || "").replace(/^https?:\/\/(?:x|twitter)\.com/, "");
  const [pathname, search] = s.split("?");
  const cleanPath = (pathname || "/").replace(/\/$/, "") || "/";
  return search ? `${cleanPath}?${search}` : cleanPath;
}

export function navigateX(path) {
  if (!path) return;
  const cur = normPath(location.pathname + location.search);
  const dest = normPath(path);
  if (cur === dest) return;
  if (clickAnchorByPath(dest)) return;
  if (dest.includes("history/likes") && (clickAnchorByPath("/i/history/likes") || clickAnchorByPath("/i/bookmarks/likes"))) return;
  if (dest.includes("history") && (clickAnchorByPath("/i/history") || clickAnchorByPath("/i/bookmarks"))) return;
  console.info("[x-im:nav] fallback pushState", path);
  try {
    history.pushState(null, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  } catch {
    location.assign(path);
  }
}

/** 找到 href（相对/绝对、带查询串均归一）等于目标路径的原生链接并点击：SPA 导航，不刷新页面 */
export function clickAnchorByPath(dest) {
  if (!dest) return false;
  const statusId = dest.match(/\/(?:status\/)?(\d+)/)?.[1];
  for (const a of document.querySelectorAll("a[href]")) {
    const h = a.getAttribute("href") || "";
    if (h && normPath(h) === dest) {
      if (typeof a.click === "function") {
        a.click();
        return true;
      }
    }
  }
  // 兜底：按推文 id 部分命中（如气泡兜底 /status/123 但原生链接是 /handle/status/123）
  if (statusId) {
    for (const a of document.querySelectorAll('a[href*="/status/"]')) {
      const h = a.getAttribute("href") || "";
      if (h && h.match(/\/status\/(\d+)/)?.[1] === statusId) {
        if (typeof a.click === "function") {
          a.click();
          console.info("[x-im:nav] matched by status id", statusId);
          return true;
        }
      }
    }
  }
  return false;
}

export function openCompose() {
  if (clickNative('[data-testid="SideNav_NewTweet_Button"]')) return;
  if (clickNative('[data-testid="tweetButtonInline"]')) return;
  if (clickNative('a[href="/compose/post"]')) return;
  location.assign("/compose/post");
}

export function openSearch(q) {
  const query = (q || "").trim();
  if (!query) {
    navigateX("/explore");
    return;
  }
  const url = `/search?q=${encodeURIComponent(query)}&src=typed_query`;
  history.pushState(null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function extractTweet(article) {
  try {
    const statusA = article.querySelector('a[href*="/status/"]');
    const href = statusA?.getAttribute("href") || "";
    const id = (href.match(/status\/(\d+)/) || [])[1];
    if (!id) return null;
    const quoteEl = findQuoteRoot(article);
    const nameBlock = [...article.querySelectorAll('[data-testid="User-Name"]')].find((el) => !quoteEl || !quoteEl.contains(el));
    const displayName = stripText(nameBlock?.querySelector("span")?.textContent || "");
    const handleA = nameBlock?.querySelector('a[href^="/"]');
    const handle = (handleA?.getAttribute("href") || "").replace(/^\//, "").split("/")[0];
    // 回复提示：名字区里除了自己外出现的 @handle（X 渲染「Replying to @hh」/「回复 @hh」），用来给互相回复做引用
    let replyTo = "";
    if (!quoteEl) {
      const zone = stripText(nameBlock?.parentElement?.parentElement?.textContent || "");
      const tokens = [...zone.matchAll(/@([A-Za-z0-9_]{1,20})/g)].map((m) => m[1]);
      const self = handle || "";
      replyTo = tokens.find((h) => h && h !== self)
        || (tokens.length > (self ? 1 : 0) ? tokens[tokens.length - 1] : "");
    }
    const textEl = [...article.querySelectorAll('[data-testid="tweetText"]')].find((el) => !quoteEl || !quoteEl.contains(el));
    const text = stripText(textEl?.innerText || "");
    const html = textEl ? textEl.innerHTML : "";
    const timeEl = [...article.querySelectorAll("time")].find((el) => !quoteEl || !quoteEl.contains(el));
    const time = stripText(timeEl?.textContent || "");
    const datetime = timeEl?.getAttribute("datetime") || "";
    const avaRoot = [...article.querySelectorAll('[data-testid="Tweet-User-Avatar"], [data-testid^="UserAvatar-Container"]')].find((el) => !quoteEl || !quoteEl.contains(el));
    let rawAva = avaRoot ? imgSrc(avaRoot) : "";
    if (!rawAva) {
      const anyImg = [...article.querySelectorAll("img")].find((i) => /profile_images/.test(i.currentSrc || i.src || i.getAttribute("src") || ""));
      rawAva = anyImg ? (anyImg.currentSrc || anyImg.src || anyImg.getAttribute("src")) : "";
    }
    if (!rawAva) {
      const anyBg = [...article.querySelectorAll('[style*="profile_images"]')][0];
      if (anyBg) rawAva = bgProfile(anyBg);
    }
    const avatar = rawAva.replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2").replace(/_mini(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
    let photoEls = [...article.querySelectorAll('[data-testid="tweetPhoto"] img, [data-testid="tweetPhotoContainer"] img')]
      .filter((img) => img.src && (!quoteEl || !quoteEl.contains(img)));
    if (!photoEls.length) {
      // 新版 testid/virtual DOM 变化时兜底召回：media 大图（排除引推、头像、外链卡片缩略、头像卡图）
      photoEls = [...article.querySelectorAll("img")]
        .filter((img) => {
          const src = img.src || "";
          if (!/pbs\.twimg\.com\/media(?!\/profile_images)/.test(src)) return false;
          if (quoteEl && quoteEl.contains(img)) return false;
          const a = img.closest("a");
          const href = a?.getAttribute("href") || "";
          return !a || /^\/[^/]+\/status\/[^/]+\/photo\//.test(href); // 站内 photo 链接才收，外链卡片缩略不收
        });
      if (!photoEls.length) {
        // 背景图形式最后兜底：div style background 里的 media url
        photoEls = [...article.querySelectorAll("[style]")]
          .filter((el) => !quoteEl || !quoteEl.contains(el))
          .flatMap((el) => {
            const m = /url\(["']?(https:\/\/pbs\.twimg\.com\/media\/[^"')\s]+)/.exec(el.style?.backgroundImage || "");
            return m ? [{ src: m[1].replace(/&amp;/g, "&") }] : [];
          });
      }
    }
    const photos = photoEls.map((img) => img.src);
    const alts = photoEls.map((img) => ((img.getAttribute("alt") || "").trim() ? 1 : 0));
    const live = !!article.querySelector('a[href*="/i/spaces/"], [data-testid="audioSpace"], a[href*="/i/broadcasts/"]');
    const quote = extractQuoteFrom(quoteEl, id);
    const linkCard = !quote ? extractLinkCard(article) : null;
    const video = extractVideo(article, quoteEl, id);
    const poll = extractPoll(article);
    const isNote = !!article.querySelector('[data-testid="noteTweet"], [data-testid="noteTweetInline"]');
    const socialCtx = stripText(article.querySelector('[data-testid="socialContext"]')?.innerText || "");
    let reposter = "";
    let repliedTo = "";
    if (socialCtx) {
      if (/(Reposted|转发了)/i.test(socialCtx)) reposter = socialCtx.replace(/\s*(Reposted|转发了)\s*$/i, "").trim();
      else if (/(replied|回复了?)/i.test(socialCtx)) repliedTo = socialCtx.replace(/\s*(replied|回复了?)\s*$/i, "").trim();
    }
    const verified = !!article.querySelector('[data-testid="User-Name"] svg[aria-label="Verified"], [data-testid="User-Name"] svg[aria-label="已认证"]');
    // X 自带翻译状态：DOM 里 tweetText 是译文（有「显示原文」）还是原文（有「显示翻译」）。
    // 跟随 X 现状 + IM 提供切换按钮（点原生按钮重新渲染后由 sync upsert 该消息）。
    let translated;
    const transBtn = [...article.querySelectorAll("button")].find((b) =>
      /显示原文|显示翻译|显示译文|翻译成|翻译为|Show original|Show translation|Translate/i.test(b.getAttribute("aria-label") || "")
    );
    if (transBtn) translated = /显示原文|Show original/i.test(transBtn.getAttribute("aria-label") || "");
    const me = nativeProfilePath();
    const mine = !!(me && article.querySelector(`a[href="${me}"], a[href="${me}/"]`));
    const groupEl = article.querySelector('[role="group"][aria-label]');
    const groupStats = parseGroupStats(groupEl?.getAttribute("aria-label") || "");
    const replyBtn = article.querySelector('[data-testid="reply"]');
    const rtBtn = article.querySelector('[data-testid="retweet"], [data-testid="unretweet"]');
    const likeBtn = article.querySelector('[data-testid="like"], [data-testid="unlike"]');
    const bookmarkBtn = article.querySelector('[data-testid="bookmark"], [data-testid="removeBookmark"]');
    const viewEl = article.querySelector('a[href*="/analytics"], [data-testid="analytics"]');

    const replyCount = extractStat(replyBtn) || groupStats.reply || "";
    const rtCount = extractStat(rtBtn) || groupStats.retweet || "";
    const likeCount = extractStat(likeBtn) || groupStats.like || "";
    const bookmarkCount = extractStat(bookmarkBtn) || groupStats.bookmark || "";
    const viewCount = extractStat(viewEl) || groupStats.views || "";

    const liked = !!article.querySelector('[data-testid="unlike"]');
    const retweeted = !!article.querySelector('[data-testid="unretweet"]');
    const bookmarked = !!article.querySelector('[data-testid="removeBookmark"]');

    return {
      id, href, name: displayName || handle || "用户", handle, text, html, time, datetime,
      avatar, photos, alts, live, quote, linkCard, video, poll, isNote,
      replyCount, rtCount, likeCount, bookmarkCount, viewCount,
      liked, retweeted, bookmarked,
      reposter, repliedTo, replyTo, verified, mine, translated,
    };
  } catch {
    return null;
  }
}

/** 新版 X 引用卡不再带 quoteTweet testid，靠「引用」标签或内嵌 User-Name+tweetText 的 role=link */
function findQuoteRoot(article) {
  const classic = article.querySelector('[data-testid="quoteTweet"]');
  if (classic) return classic;
  const card = article.querySelector('[data-testid="card.wrapper"], [data-testid^="card."]');
  if (card?.querySelector('[data-testid="User-Name"], [data-testid="tweetText"]')) return card;
  const lab = [...article.querySelectorAll("span")].find((s) => /^(引用|Quote)$/i.test(stripText(s.textContent)));
  const labeled = lab?.closest("div")?.parentElement?.querySelector('[role="link"]');
  if (labeled?.querySelector('[data-testid="User-Name"]')) return labeled;
  return [...article.querySelectorAll('[role="link"]')].find((el) =>
    el !== article
    && el.querySelector('[data-testid="User-Name"]')
    && el.querySelector('[data-testid="tweetText"]')
  ) || null;
}

function quoteStatusHref(quoteEl, mainId) {
  // 引用卡里的 a[href*="/status/"] 常是外层主推的时间/分析链接（新版引用卡不加被引用帖自身链接），
  // 排除主推与 /analytics 后剩下的才可能是被引用帖真实链接
  const links = [...quoteEl.querySelectorAll('a[href*="/status/"]')]
    .map((a) => a.getAttribute("href") || "")
    .filter((h) => h && !/\/analytics$/.test(h) && !(mainId && h.includes(`/status/${mainId}`)));
  if (links.length) return links[0];
  const self = quoteEl.getAttribute("href") || "";
  if (/\/status\//.test(self)) return self;
  const blob = `${quoteEl.innerHTML || ""}\n${quoteEl.innerText || ""}`;
  const m = blob.match(/(?:https?:\/\/(?:www\.)?(?:x|twitter)\.com)?\/([A-Za-z0-9_]+)\/status\/(\d+)/);
  return m ? `/${m[1]}/status/${m[2]}` : "";
}

// 引推结构化：{ name, text, href, photos, cover, key }
function extractQuoteFrom(quoteEl, mainId) {
  if (!quoteEl) return null;
  if (!quoteEl.querySelector('[data-testid="User-Name"], [data-testid="tweetText"]')) return null;
  const qName = stripText(quoteEl.querySelector('[data-testid="User-Name"] span')?.textContent || "");
  const qTextEl = quoteEl.querySelector('[data-testid="tweetText"]');
  const qText = qTextEl
    ? stripText(qTextEl.innerText || "")
    : stripText(quoteEl.innerText || "").replace(qName, "").trim();
  const qHref = quoteStatusHref(quoteEl, mainId);
  const qAvaRaw = quoteEl.querySelector('[data-testid="UserAvatar-Container"] img, [data-testid="Tweet-User-Avatar"] img')?.src || "";
  const qAvatar = qAvaRaw
    .replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2")
    .replace(/_mini(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
  const qPhotos = [...quoteEl.querySelectorAll("img")]
    .map((img) => img.src)
    .filter((src) => /pbs\.twimg\.com\/media/.test(src));
  // 视频引推：引用卡内嵌原生 <video>（preload=none + blob:，本地无直链），
  // 只取 poster 封面 + hasVideo 标记；点播放时再走被引用帖详情 API 抓 https 直链
  const qVid = quoteEl.querySelector("video");
  const qVideo = qVid
    ? {
        src: "",
        poster: qVid.getAttribute("poster")
          || quoteEl.querySelector('img[src*="amplify_video_thumb"], img[src*="video_thumb"]')?.src
          || "",
        hasVideo: true,
      }
    : null;
  const qCover = qPhotos[0] || qVideo?.poster || "";
  if (!qText && !qCover) return null;
  if (!quoteEl.dataset.ximQuote) {
    quoteEl.dataset.ximQuote = "xq-" + (qHref.match(/status\/(\d+)/)?.[1] || String(++quoteMarkSeq));
  }
  return {
    name: qName || "引用",
    text: qText.slice(0, 2000) || "",
    href: qHref,
    avatar: qAvatar,
    cover: qCover,
    photos: qPhotos.slice(0, 4),
    video: qVideo,
    key: quoteEl.dataset.ximQuote,
  };
}

// 外链预览卡：标题 + 域名 + 缩略图（区别于引推卡）
function extractLinkCard(article) {
  const card = article.querySelector('[data-testid="card.wrapper"], [data-testid="quoteTweet"], [data-testid^="card."]');
  if (!card) return null;
  if (card.querySelector('[data-testid="User-Name"], [data-testid="tweetText"]')) return null; // 引推卡
  const linkA = card.querySelector('a[href^="http"][href*="//"]');
  const img = card.querySelector('img');
  const lines = stripText(card.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
  return {
    title: lines[0] || "",
    domain: lines[lines.length - 1] || "",
    img: img?.src && img.src.includes("pbs.twimg.com/media") ? img.src : "",
    href: linkA?.getAttribute("href") || "",
  };
}

function isVideoThumb(src) {
  return /amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb|video_thumb/.test(src || "");
}

export function findTweetArticle(tweetId) {
  if (!tweetId) return null;
  const arts = allTweetArticles();
  return arts.find((a) => [...a.querySelectorAll('a[href*="/status/"]')]
    .some((el) => (el.getAttribute("href") || "").includes(`/status/${tweetId}`)))
    || arts.find((a) => (a.innerHTML || "").includes(tweetId))
    || null;
}

export function kickNativeVideo(article) {
  if (!article) return;
  const vid = article.querySelector("video");
  if (vid) {
    try { vid.muted = true; vid.play().catch(() => {}); } catch { /* ignore */ }
  }
  const btn = article.querySelector(
    '[aria-label="Play video"], [aria-label="Play Gif"], [aria-label="Play"], [aria-label="播放视频"], [aria-label="播放 Gif"], [aria-label="播放"]'
  );
  if (btn) { btn.click(); return; }
  const vc = article.querySelector('[data-testid="videoComponent"], [data-testid="videoPlayer"]');
  const inner = vc?.querySelector("video, div[role='button'], button") || vc;
  inner?.click();
}

// 时间线经常只有封面、没有 <video>。封面 URL / videoComponent 都算视频。
function extractVideo(article, quoteEl, tweetId) {
  const scope = (el) => el && (!quoteEl || !quoteEl.contains(el));
  const vp = [...article.querySelectorAll('[data-testid="videoPlayer"], [data-testid="videoComponent"]')].find(scope);
  const vid = (vp || article).querySelector("video");
  const thumb = [...article.querySelectorAll("img")].find((img) => scope(img) && isVideoThumb(img.src || img.currentSrc));
  if (!vp && !vid && !thumb) return null;
  const host = vp || vid?.closest('[data-testid="videoPlayer"], [data-testid="videoComponent"]') || thumb?.closest("div") || article;
  if (tweetId && host) host.dataset.ximVideo = tweetId;
  // X 原生视频加载后 currentSrc 是 blob:（MSE），blob 生命周期随媒体活跃、翻页/回收即失效，
  // 绝不能持久化进 data-src；只收 https 直链（new schema 下封面态 currentSrc 多为 blob，此路径常得空，
  // 播放时另有「活动 article 抬原生 video」的 live 路径兜底）
  const pickUrl = (u) => (u && typeof u === "string" && !u.startsWith("blob:")) ? u : "";
  const src =
    pickUrl(vid?.currentSrc)
    || pickUrl(vid?.getAttribute("src"))
    || pickUrl(vid?.querySelector("source")?.getAttribute("src"))
    || "";
  const poster = vid?.getAttribute("poster") || vid?.poster || thumb?.src || vp?.querySelector("img")?.src || "";
  return { poster, src, hasSrc: !!(vid && (vid.currentSrc || vid.src)), isVideoThumb: true };
}

// 投票：只读选项列表
function extractPoll(article) {
  const el = article.querySelector('[data-testid="poll"]');
  if (!el) return null;
  const options = [...el.querySelectorAll('[role="radio"], [role="radiogroup"] [role="radio"], label')]
    .map((n) => stripText(n.innerText || ""))
    .filter((t) => t && t.length > 0 && t.length < 80);
  return options.length ? options.slice(0, 8) : null;
}

export function extractProfilePage() {
  const p = location.pathname.replace(/\/$/, "") || "/";
  const handle = p.split("/").filter(Boolean)[0];
  if (!handle) return null;
  const header = document.querySelector('[data-testid="UserName"]');
  const name = stripText(header?.querySelector("span")?.textContent || "") || handle;
  const bio = stripText(document.querySelector('[data-testid="UserDescription"]')?.innerText || "");
  const img =
    document.querySelector(`a[href="/${handle}/photo"] img`)
    || document.querySelector(`[data-testid="UserAvatar-Container-${handle}"] img`)
    || document.querySelector('[data-testid="primaryColumn"] [data-testid^="UserAvatar-Container"] img');
  const avatar = (img?.src || "").replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
  return { handle, name, bio, avatar };
}

export function currentDmId() {
  return (/\/messages\/([^/]+)/.exec(location.pathname) || [])[1] || "";
}

let cachedDms = [];

export function extractDmConversations() {
  const out = [];
  for (const a of document.querySelectorAll('a[href^="/messages/"]')) {
    const href = a.getAttribute("href") || "";
    const id = (/\/messages\/([^/]+)/.exec(href) || [])[1];
    if (!id || /(info|new|compose)$/.test(id)) continue;
    const img = a.querySelector("img");
    const lines = stripText(a.innerText || "").split("\n").map((s) => s.trim()).filter(Boolean);
    out.push({
      id,
      href,
      avatar: img?.src || "",
      name: lines[0] || "会话",
      preview: lines[1] || "",
      time: lines.length > 2 ? lines[lines.length - 1] : "",
    });
  }
  const seen = new Set();
  const unique = out.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
  if (unique.length) cachedDms = unique;
  return unique.length ? unique : cachedDms;
}

export function extractDmMessages() {
  const out = [];
  const col = document.querySelector('[data-testid="primaryColumn"]') || document;
  const rows = col.querySelectorAll('[data-testid="message"], [data-testid^="message-"], [data-testid^="message_"]');
  for (const row of rows) {
    const testid = row.getAttribute("data-testid") || "";
    const textEl = row.querySelector('[data-testid="messageText"], [data-testid="message-text"], [dir="auto"][lang]');
    const text = stripText(textEl?.innerText || "");
    if (!text) continue;
    const mine = /me/i.test(testid) || !!row.querySelector('[data-testid="message-me"], [data-testid="message-author-me"]');
    const time = stripText(row.querySelector("time")?.textContent || "");
    const name = stripText(row.querySelector('[data-testid="User-Name"] span')?.textContent || "");
    out.push({ text, mine, time, name, ava: (!mine && row.querySelector("img")?.src) || "" });
  }
  return out;
}

export function allTweetArticles() {
  return [...document.querySelectorAll('article[data-testid="tweet"]')];
}

let cachedFeedAvas = [];

/** 从可见时间线收集用户头像，供假群聊拼接头像；滚动后累积 */
export function harvestFeedAvatars() {
  const seen = new Set(cachedFeedAvas);
  const add = (raw) => {
    const src = String(raw || "")
      .replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2")
      .replace(/_mini(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
    if (!src || !/pbs\.twimg\.com\/profile_images/.test(src) || seen.has(src)) return;
    seen.add(src);
    cachedFeedAvas.push(src);
  };
  for (const art of allTweetArticles()) {
    const img = art.querySelector('[data-testid="Tweet-User-Avatar"] img');
    add(img?.currentSrc || img?.src);
  }
  if (cachedFeedAvas.length < 8) {
    for (const img of document.querySelectorAll('img[src*="profile_images"]')) add(img.currentSrc || img.src);
  }
  if (cachedFeedAvas.length > 80) cachedFeedAvas = cachedFeedAvas.slice(-80);
  return cachedFeedAvas;
}

export function primaryColumn() {
  return document.querySelector('[data-testid="primaryColumn"]')
    || document.querySelector('[aria-label="Home timeline"]')
    || document.querySelector('[aria-label*="Timeline"]')
    || document.querySelector('[aria-label*="时间线"]');
}

export function timelineRoot() {
  const col = primaryColumn();
  if (!col) return null;
  return col.querySelector('[aria-label="Home timeline"]')
    || col.querySelector('[aria-label*="Timeline"]')
    || col.querySelector('[aria-label*="时间线"]')
    || col;
}

export function loadMoreFeed() {
  const now = Date.now();
  if (now - (loadMoreFeed._t || 0) < 300) return;
  loadMoreFeed._t = now;

  const html = document.documentElement;
  html.classList.add("xim-feed-loading");

  const root = timelineRoot();
  const scope = root || document;
  const cells = scope.querySelectorAll('[data-testid="cellInnerDiv"]');
  const lastCell = cells[cells.length - 1];
  const lastTweet = scope.querySelector("article[data-testid='tweet']:last-of-type");
  const spinner = scope.querySelector('[role="progressbar"]');
  const target = spinner || lastCell || lastTweet;

  if (target) {
    try { target.scrollIntoView({ block: "end", behavior: "smooth" }); } catch { /* ignore */ }
  }

  const se = document.scrollingElement || html;
  se.scrollBy({ top: 800, behavior: "smooth" });

  if (root) {
    root.scrollTop = root.scrollHeight;
    root.dispatchEvent(new Event("scroll", { bubbles: true }));
  }
  let n = target || root;
  while (n) {
    if (n.scrollHeight > n.clientHeight + 8) n.scrollTop = n.scrollHeight;
    n = n.parentElement;
  }

  window.clearTimeout(loadMoreFeed._unlock);
  loadMoreFeed._unlock = window.setTimeout(() => html.classList.remove("xim-feed-loading"), 400);
}

/** 点原生 Home / 当前 tab，让 X 重新拉时间线 */
export function refreshHomeFeed() {
  window.scrollTo(0, 0);
  const home = document.querySelector('a[data-testid="AppTabBar_Home_Link"], a[href="/home"]');
  home?.click();
  const tab = [...document.querySelectorAll('[role="tab"]')].find((t) => t.getAttribute("aria-selected") === "true");
  tab?.click();
  const se = document.scrollingElement || document.documentElement;
  se.scrollTop = 0;
}

export function extractUserCells() {
  const cells = [...document.querySelectorAll('[data-testid="UserCell"]')];
  const users = [];
  for (const c of cells) {
    const nameA = c.querySelector('a[href^="/"]');
    const handle = (nameA?.getAttribute("href") || "").replace(/^\//, "").split("/")[0];
    const name = stripText(c.querySelector('[data-testid="User-Name"] span')?.textContent || "") || handle;
    const avaRoot = c.querySelector('[data-testid^="UserAvatar"], [data-testid="Tweet-User-Avatar"]') || c;
    let rawAva = imgSrc(avaRoot);
    if (!rawAva) {
      const anyImg = [...c.querySelectorAll("img")].find((i) => /profile_images/.test(i.currentSrc || i.src || i.getAttribute("src") || ""));
      rawAva = anyImg ? (anyImg.currentSrc || anyImg.src || anyImg.getAttribute("src")) : "";
    }
    if (!rawAva) {
      const anyBg = [...c.querySelectorAll('[style*="profile_images"]')][0];
      if (anyBg) rawAva = bgProfile(anyBg);
    }
    const avatar = rawAva.replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
    const bio = stripText(c.querySelector('div[dir="auto"]:not([data-testid="User-Name"])')?.textContent || "");
    if (handle) users.push({ name, handle, avatar, bio });
  }
  return users;
}
