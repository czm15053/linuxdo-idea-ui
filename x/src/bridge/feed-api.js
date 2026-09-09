// 推文详情抓取：用与 X 原生详情页同一套同源 GraphQL 接口读主推 + 评论区，
// 替代「切到原生 status 页再读 DOM」的旧路径 —— 点击详情完全不触发 X 路由，无加载闪屏。
// 只在点击详情那一刻发一次读请求（登录态 cookie 与官方一致）；任何失败都静默返回 null，由调用方降级为占位。

function csrf() {
  return (document.cookie.match(/(?:^|;\s*)ct0=([^;]+)/) || [])[1] || "";
}

/* —— operationId：从 X 已加载的 JS 里探测（Twitter 频繁换 id，硬编码必死；探测失败则降级） —— */
let opCache = "";
async function graphqlOpId(name) {
  if (opCache) return opCache;
  const idRe = /[A-Za-z0-9_-]{15,30}/g;
  const urls = Array.from(new Set([
    ...((window.performance?.getEntriesByType?.("resource") || []).map((e) => e.name)),
    ...[...document.querySelectorAll("script[src]")].map((s) => s.src || ""),
  ])).filter(Boolean);
  // X 的 JS 主要在 CDN 域名 abs.twimg.com，同源过滤会把它们全丢，因此只按域名白名单放行
  const pool = urls.filter((u) => /\.js(?:\?|$)/.test(u) && /^https?:\/\/(?:[a-z0-9-]+\.)?(?:x|twitter|twimg)\.com\//i.test(u));
  console.info(`[x-im:gql] probing ${name} operationId over ${pool.length} chunks…`);
  for (const url of pool) {
    let src;
    try { src = await fetch(url).then((r) => (r.ok ? r.text() : "")); } catch { continue; }
    if (!src) continue;
    const anchor = src.indexOf(`"${name}"`);
    if (anchor < 0) continue;
    const win = src.slice(Math.max(0, anchor - 4000), anchor + 2000);
    const m = win.match(/(?:queryId|operationId)\s*[=:]\s*["']([A-Za-z0-9_-]{15,30})["']/);
    if (m && m[1] !== name) {
      opCache = m[1];
      console.info(`[x-im:gql] operationId=${opCache} (queryId, ${decor(url)})`);
      return opCache;
    }
    const cands = (win.match(idRe) || []).filter((c) => c !== name && !/^\d{15,30}$/.test(c));
    if (cands.length) {
      opCache = cands[0];
      console.info(`[x-im:gql] operationId=${opCache} (nearest-id fallback, ${decor(url)})`);
      return opCache;
    }
  }
  console.warn(`[x-im:gql] operationId not found for ${name}`);
  return "";
}
const decor = (url) => { try { return new URL(url).pathname.split("/").pop() || url; } catch { return url; } };

function formatMetric(n) {
  if (!n) return "";
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return "";
  if (num >= 10000) return (num / 10000).toFixed(1).replace(/\.0$/, "") + "万";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(num);
}

/* —— Graph 推文节点 → 与 extractTweet 对齐的 t 对象（供 msgHtml / threadPinHtml 直接使用） —— */
function unwrap(node) {
  if (!node || typeof node !== "object") return null;
  if (node.__typename === "TweetWithVisibilityResults" || node.__typename === "TweetResultBySocialContext") {
    return unwrap(node.tweet || node.result || null);
  }
  if (node.__typename === "TweetUnavailable") return null;
  return node;
}

function bestVideo(mediaList) {
  for (const m of mediaList || []) {
    if (m.type !== "video" && m.type !== "animated_gif") continue;
    let best = null;
    for (const v of m.video_info?.variants || []) {
      if (v.content_type !== "video/mp4") continue;
      if (!best || (v.bitrate || 0) > (best.bitrate || 0)) best = v;
    }
    const poster = m.media_url_https || m.media_key ? `https://pbs.twimg.com/ext_tw_video_thumb/${(m.media_key || "").replace(/^[^_]+_/, "")}/pu/img/${(m.media_url_https || "").split("/").pop()}` : "";
    return {
      src: best?.url || "",
      poster: m.media_url_https || poster || "",
    };
  }
  return null;
}

/* —— 视频 poster → 直链缓存：任一详情成功抓取即记住线程里全部视频(含被引用帖)的 mp4。
       新版引用卡无链接无 id，播放时只能认 poster，命中缓存即可直接播、不必再发 API 请求。 —— */
const posterSrcCache = new Map();
export function rememberPosterVideo(poster, src) {
  if (poster && src) posterSrcCache.set(poster.split("?")[0], src);
}
export function posterVideoSrc(poster) {
  if (!poster) return "";
  return posterSrcCache.get(poster.split("?")[0]) || "";
}
export function rememberDetailVideos(detail) {
  if (!detail?.pin) return;
  for (const it of [detail.pin, ...(detail.replies || [])]) {
    if (!it) continue;
    rememberPosterVideo(it.video?.poster, it.video?.src);
    rememberPosterVideo(it.quote?.video?.poster, it.quote?.video?.src);
  }
}

/** 判定 User 型节点：显式 __typename 或 顶层/legacy 里带身份字段（抗新版把身份放顶层、legacy 残缺）。
    注意不能仅凭「有 legacy 对象」判定——Tweet 节点也有 legacy；身份字段落在 name/screen_name/profile_image_url_https/avatar 上才算。 */
function isUser(node) {
  if (!node || typeof node !== "object") return false;
  if (node.__typename === "User") return true;
  const l = node.legacy || node.result?.legacy || {};
  const c = node.core || node.result?.core || {};
  return !!(l.screen_name || l.name || l.profile_image_url_https || node.screen_name || node.name || node.avatar || c.name || c.screen_name);
}

/** 深扫 User：先显式路径，再深度优先全局找第一个 User 型节点（抗任意 wrapper 改名）；只认 User，不采引用/转推 */
function findUserLegacy(node, depth = 0) {
  if (!node || typeof node !== "object" || depth > 8) return null;
  // 显式路径：core/user_results 可能包 result，也可能直接是 User 节点
  for (const uw of [node.core?.user_results?.result, node.core?.user_results, node.user_results?.result, node.user_results]) {
    const u = uw && unwrap(uw);
    if (isUser(u)) return u;
  }
  // 深度优先兜底：找任意 User 节点，撞上引用/转推用户时以深度最浅者为准
  for (const k of Object.keys(node)) {
    if (k === "quoted_status_result" || k === "retweeted_status") continue;
    const f = findUserLegacy(node[k], depth + 1);
    if (f) return f;
  }
  return null;
}

function toTweet(node, userHandle) {
  const r = unwrap(node);
  if (!r) return null;
  const legacy = r.legacy || {};
  const id = String(r.rest_id || legacy.id_str || "");
  if (!id) return null;
  // user 信息多候选路径：实机 TweetDetail 响应里 user_results 层级不稳定，逐个兜底。
  // 新版 User 节点把身份信息放顶层（legacy 仅是残缺兼容层、可能无 screen_name），故 legacy 与顶层双读、逐值兜底。
  // 注意：不能把 User 节点的 id/rest_id（可能形如 "User:14860..."）当 handle 兜底——那是用户 ID 签名、不是屏幕名，
  // 一旦落入它会掩盖「身份缺失」并让 dump 永不触发。
  const u = findUserLegacy(r);
  const ulRaw = u?.legacy || u?.result?.legacy || {};
  const uTop = u || {};
  // 新版 User 节点（dump 实证）：身份迁到 core.created_at/name/screen_name，头像在 avatar.image_url，
  // legacy 只留描述/计数；与旧版 legacy/顶层路径共存，逐源兜底
  const uc = uTop.core || uTop.result?.core || {};
  const asStr = (v) => (typeof v === "string" ? v : (v && v.text) || "");
  const handle = ulRaw.screen_name || uTop.screen_name || asStr(uc.screen_name) || userHandle || "";
  const name = ulRaw.name || uTop.name || asStr(uc.name) || "";
  let avatar = ulRaw.profile_image_url_https
    || uTop.profile_image_url_https
    || uTop.profile_image_url
    || (typeof uTop.avatar === "string" ? uTop.avatar : (uTop.avatar?.image_url || uTop.avatar?.url))
    || (typeof uc.avatar === "string" ? uc.avatar : (uc.avatar?.image_url || uc.avatar?.url))
    || "";
  avatar = avatar.replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
  const media = legacy.extended_entities?.media || legacy.entities?.media || [];
  const photos = media
    .filter((m) => m.type === "photo")
    .map((m) => m.media_url_https || (m.media_key ? `https://pbs.twimg.com/media/${m.media_key.split("_")[0]}` : ""))
    .filter(Boolean);
  const video = bestVideo(media);
  if (video && photos.length) photos.splice(0, photos.length - (photos.length - 1)); // 缩略图不进照片
  let quote = null;
  const qr = r.quoted_status_result?.result;
  if (qr) {
    const q = toTweet(qr);
    if (q) {
      quote = {
        name: q.name,
        text: q.text || q.snippet || "",
        href: q.href,
        avatar: q.avatar,
        cover: (q.photos || [])[0] || q.video?.poster || "",
        photos: (q.photos || []).slice(0, 4),
        video: q.video ? { src: q.video.src || "", poster: q.video.poster || "" } : null,
        key: "gq-" + id,
      };
    }
  }
  const replyTo = legacy.in_reply_to_screen_name || "";
  return {
    id,
    href: `/${handle}/status/${id}`,
    name: name || handle || "用户",
    handle,
    text: legacy.full_text || legacy.text || "",
    html: "",
    time: legacy.created_at || "",
    datetime: legacy.created_at || "",
    avatar,
    photos,
    alts: photos.map(() => 0),
    video,
    quote,
    linkCard: null,
    poll: null,
    live: !!legacy.is_live,
    isNote: false,
    replyCount: formatMetric(legacy.reply_count),
    rtCount: formatMetric(legacy.retweet_count),
    likeCount: formatMetric(legacy.favorite_count),
    bookmarkCount: formatMetric(legacy.bookmark_count),
    viewCount: formatMetric(r.views?.count || legacy.ext_views?.count || legacy.view_count_info?.view_count),
    liked: !!(legacy.favorited || r.legacy?.favorited),
    retweeted: !!(legacy.retweeted || r.legacy?.retweeted),
    bookmarked: !!(legacy.bookmarked || r.legacy?.bookmarked),
    reposter: "",
    repliedTo: "",
    replyTo,
    verified: !!(ulRaw.verified || uTop.is_blue_verified || uTop.verified || r.verified_type),
    mine: false,
    following: !!(ulRaw.following || uTop.following || false),
  };
}

/** 递归收集响应里的全部 Tweet 节点（跳过引用/转推嵌套，避免把 quote、转发对象当评论） */
function walkTweetNodes(node, out) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) { node.forEach((n) => walkTweetNodes(n, out)); return; }
  const u = unwrap(node);
  if (u && u !== node && u.__typename === "Tweet") node = u;
  if (node.__typename === "Tweet") { out.push(node); return; }
  for (const k of Object.keys(node)) {
    if (k === "quoted_status_result" || k === "retweeted_status") continue;
    walkTweetNodes(node[k], out);
  }
}

function parseTweetDetail(json) {
  const data = json?.data || json || {};
  const nodes = [];
  walkTweetNodes(data, nodes);
  let rootNode = data.tweetResult?.result || data.tweetResult || data.result;
  let root = rootNode ? toTweet(rootNode) : null;
  if (!root) root = nodes.length ? toTweet(nodes[0]) : null;
  const replies = [];
  if (root) {
    const seen = new Set([root.id]);
    for (const n of nodes) {
      const t = toTweet(n);
      if (!t || t.id === root.id || seen.has(t.id)) continue;
      seen.add(t.id);
      replies.push(t);
    }
  }
  return root ? { pin: root, replies } : null;
}

/* —— 硬编码兜底 operationId：来自社区维护的最新值（twitter-reader）；X 升级失效时需更新 —— */
const FALLBACK_OP_IDS = {
  TweetDetail: ["jd3V43oDY9cY7obs1YMfbQ"],
  NotificationsTimeline: ["lXkwcYxJtGMm63D8jTPtSA"],
  SearchTimeline: ["KPSo2_UWdOMpPJwjhfT1Qg"],
};

const NOTIFICATIONS_FEATURES_JSON = '{"rweb_video_screen_enabled":false,"rweb_cashtags_enabled":true,"profile_label_improvements_pcf_label_in_post_enabled":true,"responsive_web_profile_redirect_enabled":true,"rweb_tipjar_consumption_enabled":false,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"premium_content_api_read_enabled":false,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"responsive_web_grok_analyze_button_fetch_trends_enabled":false,"responsive_web_grok_analyze_post_followups_enabled":true,"rweb_cashtags_composer_attachment_enabled":true,"responsive_web_jetfuel_frame":true,"rweb_sports_post_context_enabled":true,"responsive_web_grok_share_attachment_enabled":true,"responsive_web_grok_annotations_enabled":true,"articles_preview_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"rweb_conversational_replies_downvote_enabled":false,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"content_disclosure_indicator_enabled":true,"content_disclosure_ai_generated_indicator_enabled":true,"responsive_web_grok_show_grok_translated_post":true,"responsive_web_grok_analysis_button_from_backend":true,"post_ctas_fetch_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_grok_image_annotation_enabled":true,"responsive_web_grok_imagine_annotation_enabled":true,"responsive_web_grok_community_note_auto_translation_is_enabled":true,"responsive_web_enhance_cards_enabled":false}';

/* —— 完整参数集参照 twitter-reader 硬编码版（X 官方当前字段，缺失 features 时接口会拒绝） —— */
const TWEET_DETAIL_FEATURES_JSON = '{"rweb_video_screen_enabled":false,"rweb_cashtags_enabled":true,"profile_label_improvements_pcf_label_in_post_enabled":true,"responsive_web_profile_redirect_enabled":false,"rweb_tipjar_consumption_enabled":false,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"premium_content_api_read_enabled":false,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"responsive_web_grok_analyze_button_fetch_trends_enabled":false,"responsive_web_grok_analyze_post_followups_enabled":true,"rweb_cashtags_composer_attachment_enabled":true,"responsive_web_jetfuel_frame":true,"responsive_web_grok_share_attachment_enabled":true,"responsive_web_grok_annotations_enabled":true,"articles_preview_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"rweb_conversational_replies_downvote_enabled":false,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"content_disclosure_indicator_enabled":true,"content_disclosure_ai_generated_indicator_enabled":true,"responsive_web_grok_show_grok_translated_post":true,"responsive_web_grok_analysis_button_from_backend":true,"post_ctas_fetch_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":false,"responsive_web_grok_image_annotation_enabled":true,"responsive_web_grok_imagine_annotation_enabled":true,"responsive_web_grok_community_note_auto_translation_is_enabled":true,"responsive_web_enhance_cards_enabled":false}';

function tweetDetailVars(id) {
  return {
    focalTweetId: id,
    cursor: "",
    referrer: "tweet",
    with_rux_injections: false,
    rankingMode: "Relevance",
    includePromotedContent: true,
    withCommunity: true,
    withQuickPromoteEligibilityTweetFields: true,
    withBirdwatchNotes: true,
    withVoice: true,
  };
}

const TWEET_DETAIL_FIELD_TOGGLES = {
  withArticleRichContentState: true,
  withArticlePlainText: false,
  withArticleSummaryText: true,
  withArticleVoiceOver: true,
  withGrokAnalyze: false,
  withDisallowedReplyControls: false,
};

/* —— X 自带翻译：POST /i/api/…/translation/original（网页端翻译按钮同款接口，仅需推文 id，不依赖原生按钮存在）。
       客户端自管理原文/译文切换，成功即缓存该 id；失败返回空串。 —— */
const transCache = new Map();
const TRANS_BEARER = "AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

/* —— X 频繁换翻译接口路径，从已加载 JS 里探测当前真实路径（同 graphqlOpId 思路）；探测 miss 再退候选 —— */
let transProbePath = "";
async function probeTranslationPath() {
  if (transProbePath) return transProbePath;
  const pool = Array.from(new Set((window.performance?.getEntriesByType?.("resource") || []).map((e) => e.name)))
    .filter((u) => /\.js(?:\?|$)/.test(u) && /^https?:\/\/(?:[a-z0-9-]+\.)?(?:x|twitter|twimg)\.com\//i.test(u));
  // 先试同源 x.com 的 chunk（fetch 必有 CORS），再退到 twimg CDN（需 CORS 允许）
  const ordered = [...pool.filter((u) => /\/x\.com\//i.test(u)), ...pool.filter((u) => /twimg\.com\//i.test(u))];
  for (const url of ordered.slice(0, 12)) {
    let src;
    try { src = await fetch(url).then((r) => (r.ok ? r.text() : "")); } catch { continue; }
    if (!src || src.length > 6e6) continue;
    const m = src.match(/["'`]((?:\/i\/api\/)?[^"'`{}]{4,120}translation[^"'`{}]{0,60}original[^"'`{}]{0,40})["'`]/i)
      || src.match(/translation\/(?:original|mutate)[^"'`\s]*/i);
    if (m) {
      let found = m[1];
      try { found = new URL(found, location.origin).pathname || found; } catch { /* 原样用 */ }
      if (/\/i\/api\/.+translation.+original/i.test(found)) {
        transProbePath = found;
        console.info(`[x-im:trans] probe → ${transProbePath}`);
        return transProbePath;
      }
    }
  }
  console.warn("[x-im:trans] probe miss");
  return "";
}

/* 现行权威接口（2026-09 抓包确认）：POST https://api.x.com/2/grok/translation.json
   body {"content_type":"POST","id":<tweet_id>,"dst_lang":"zh"}，响应 json.result.text。
   旧 /i/api/2 与 /i/api/1.1 已 404；保留探测与候选仅为将来 X 再改接口兜底。 */
export function requestXTranslation(tweetId) {
  const key = String(tweetId);
  if (transCache.has(key)) return transCache.get(key);
  const p = (async () => {
    const baseHeaders = {
      authorization: `Bearer ${TRANS_BEARER}`,
      "x-csrf-token": csrf(),
      referer: "https://x.com/",
      "x-twitter-client-language": "zh-cn",
      "x-twitter-active-user": "yes",
      "x-twitter-auth-type": "OAuth2Session",
      "content-type": "text/plain;charset=UTF-8",
    };
    try {
      const res = await fetch("https://api.x.com/2/grok/translation.json", {
        method: "POST",
        credentials: "include",
        headers: baseHeaders,
        body: JSON.stringify({ content_type: "POST", id: key, dst_lang: "zh" }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        const s = json?.result?.text || "";
        if (s) { console.info(`[x-im:trans] ok → ${s.length} chars`); return s; }
      }
      console.warn(`[x-im:trans] modern http ${res.status}:`,
        (json?.errors || []).map((e) => e.message).join(";") || String(json?.result).slice(0, 160));
    } catch (err) {
      console.warn(`[x-im:trans] modern threw:`, err && err.message);
    }
    /* 兜底：老路径 / 探测路径（X 若回退旧方案仍可用） */
    const real = await probeTranslationPath();
    const paths = real ? [real] : ["/i/api/2/translation/original", "/i/api/1.1/translation/original"];
    for (const path of paths) {
      const qs = new URLSearchParams({ destination_language: "zh-cn", tweet_id: key, feature: "translation" });
      try {
        const res = await fetch(`${path}?${qs}`, {
          method: "POST",
          credentials: "include",
          headers: { authorization: `Bearer ${TRANS_BEARER}`, "x-csrf-token": csrf(), "content-type": "application/json" },
          body: "{}",
        });
        if (!res.ok) { console.warn(`[x-im:trans] ${path} http ${res.status}`); continue; }
        const json = await res.json();
        const d = json?.data?.translation;
        const s = typeof d === "string" ? d : (d && (d.translation || d.full_text)) || "";
        if (s) { console.info(`[x-im:trans] fallback ok → ${s.length} chars`); return s; }
      } catch { /* 忽略，继续回退 */ }
    }
    return "";
  })();
  transCache.set(key, p);
  return p;
}

/* —— 对外：抓推文详情（主推 + 首屏回复）；失败返回 null —— */
let inflight = new Map();
export function fetchTweetDetail(id) {
  if (inflight.has(id)) return inflight.get(id);
  const tryOps = async (ops) => {
    const features = JSON.parse(TWEET_DETAIL_FEATURES_JSON);
    const qs = new URLSearchParams({
      variables: JSON.stringify(tweetDetailVars(id)),
      features: JSON.stringify(features),
      fieldToggles: JSON.stringify(TWEET_DETAIL_FIELD_TOGGLES),
    });
    for (const opId of ops) {
      const url = `/i/api/graphql/${opId}/TweetDetail?${qs}`;
      try {
        const res = await fetch(url, {
          credentials: "include",
          headers: {
            authorization: "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
            "x-twitter-client-language": "en",
            "x-twitter-active-user": "yes",
            "x-twitter-auth-type": "OAuth2Session",
            "x-csrf-token": csrf(),
          },
        });
        if (!res.ok) {
          console.warn(`[x-im:gql] ${opId} http ${res.status}`);
          continue;
        }
        const json = await res.json();
        const detail = parseTweetDetail(json);
        if (detail) { rememberDetailVideos(detail); return detail; }
        const errs = (json?.errors || []).map((e) => e.message).join("; ") || "(no tweet in payload)";
        console.warn(`[x-im:gql] ${opId} parse failed:`, errs);
      } catch (err) {
        console.warn(`[x-im:gql] ${opId} fetch threw:`, err && err.message);
      }
    }
    return null;
  };
  const p = (async () => {
    let detail = await tryOps(FALLBACK_OP_IDS.TweetDetail || []);
    if (detail) {
      console.info(`[x-im:gql] TweetDetail ok · ${detail.replies.length} replies`);
      return detail;
    }
    // 硬编码失效（X 换代）：再从已加载 JS 探测当前 id 补试
    const probed = await graphqlOpId("TweetDetail");
    if (probed) detail = await tryOps([probed]);
    return detail;
  })();
  inflight.set(id, p);
  p.finally(() => inflight.delete(id)).catch(() => {});
  return p;
}

function parseSingleNotification(itemContent) {
  if (!itemContent) return null;
  // 1. 直接是推文（提及 / 回复）
  const tr = itemContent.tweet_results?.result || itemContent.tweetResult?.result;
  if (tr) {
    const t = toTweet(tr);
    if (t) return { type: "tweet", tweet: t };
  }
  // 2. 交互通知（赞 / 转帖 / 关注等）
  const notif = itemContent.notification || itemContent.notification_result?.result;
  if (notif) {
    const users = (notif.from_users || notif.users || []).map((u) => {
      const ur = unwrap(u);
      return {
        name: ur?.legacy?.name || ur?.name || "",
        handle: ur?.legacy?.screen_name || ur?.screen_name || "",
        avatar: (ur?.legacy?.profile_image_url_https || ur?.avatar?.image_url || ur?.avatar || "").replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2"),
      };
    });
    const targetTweetNode = notif.target_tweet_results?.result || notif.tweet?.result;
    const targetTweet = targetTweetNode ? toTweet(targetTweetNode) : null;
    const desc = notif.message?.text || notif.headline?.text || "";
    return {
      type: "activity",
      id: notif.id || String(Math.random()),
      icon: notif.icon?.id || notif.icon || "notification",
      desc,
      users,
      targetTweet,
      time: notif.created_at || (notif.timestamp_ms ? new Date(Number(notif.timestamp_ms)).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : ""),
    };
  }
  // 兜底递归找 Tweet
  const nodes = [];
  walkTweetNodes(itemContent, nodes);
  if (nodes.length) {
    const t = toTweet(nodes[0]);
    if (t) return { type: "tweet", tweet: t };
  }
  return null;
}

export async function fetchNotificationsTimeline(timelineType = "All", cursor = "") {
  let opId = (FALLBACK_OP_IDS.NotificationsTimeline || [])[0];
  if (!opId) opId = await graphqlOpId("NotificationsTimeline");
  if (!opId) opId = "lXkwcYxJtGMm63D8jTPtSA";

  const vars = {
    timeline_type: timelineType === "Mentions" ? "Mentions" : "All",
    cursor: cursor || "",
    count: timelineType === "Mentions" ? 40 : 20,
  };
  const qs = new URLSearchParams({
    variables: JSON.stringify(vars),
    features: NOTIFICATIONS_FEATURES_JSON,
  });
  const url = `/i/api/graphql/${opId}/NotificationsTimeline?${qs}`;
  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        authorization: "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "x-twitter-client-language": "zh-cn",
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-csrf-token": csrf(),
      },
    });
    if (!res.ok) {
      console.warn(`[x-im:notify] http ${res.status}`);
      return [];
    }
    const json = await res.json();
    const instructions = json?.data?.viewer_v2?.user_results?.result?.notification_timeline?.timeline?.instructions
      || json?.data?.notification_timeline?.timeline?.instructions
      || [];
    const list = [];
    for (const inst of instructions) {
      if (inst.type !== "TimelineAddEntries") continue;
      for (const entry of inst.entries || []) {
        const content = entry.content || {};
        if (content.entryType === "TimelineTimelineItem") {
          const item = parseSingleNotification(content.itemContent);
          if (item) list.push(item);
        } else if (content.entryType === "TimelineTimelineModule") {
          for (const sub of content.items || []) {
            const item = parseSingleNotification(sub.item?.itemContent);
            if (item) list.push(item);
          }
        }
      }
    }
    return list;
  } catch (err) {
    console.warn("[x-im:notify] fetch failed:", err);
    return [];
  }
}

function parseSearchTimeline(json) {
  const instructions = json?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions
    || json?.data?.search_timeline?.timeline?.instructions
    || [];
  const items = [];
  const seen = new Set();
  for (const inst of instructions) {
    if (inst.type !== "TimelineAddEntries") continue;
    for (const entry of inst.entries || []) {
      const content = entry.content || {};
      if (content.entryType === "TimelineTimelineItem") {
        const tr = content.itemContent?.tweet_results?.result;
        if (tr) {
          const t = toTweet(tr);
          if (t && !seen.has(t.id)) { seen.add(t.id); items.push({ type: "tweet", tweet: t }); }
        } else if (content.itemContent?.user_results?.result || content.itemContent?.userResult?.result || content.itemContent?.user?.result) {
          const uNode = content.itemContent?.user_results?.result || content.itemContent?.userResult?.result || content.itemContent?.user?.result;
          const u = unwrap(uNode);
          if (u) {
            const handle = u.legacy?.screen_name || u.core?.screen_name || u.screen_name || "";
            const name = u.legacy?.name || u.core?.name || u.name || handle;
            const avatar = (
              u.legacy?.profile_image_url_https
              || u.profile_image_url_https
              || (typeof u.avatar === "string" ? u.avatar : (u.avatar?.image_url || u.avatar?.url))
              || ""
            ).replace(/_normal(\.[a-zA-Z]+)?(\?|$)/, "_bigger$1$2");
            const bio = u.legacy?.description || u.profile_bio?.description || "";
            if (handle && !seen.has("u:" + handle)) {
              seen.add("u:" + handle);
              items.push({ type: "user", user: { name, handle, avatar, bio } });
            }
          }
        }
      } else if (content.entryType === "TimelineTimelineModule") {
        for (const sub of content.items || []) {
          const tr = sub.item?.itemContent?.tweet_results?.result;
          if (tr) {
            const t = toTweet(tr);
            if (t && !seen.has(t.id)) { seen.add(t.id); items.push({ type: "tweet", tweet: t }); }
          }
        }
      }
    }
  }
  if (!items.length) {
    const nodes = [];
    walkTweetNodes(instructions, nodes);
    for (const n of nodes) {
      const t = toTweet(n);
      if (t && !seen.has(t.id)) { seen.add(t.id); items.push({ type: "tweet", tweet: t }); }
    }
  }
  return items;
}

export async function fetchSearchTimeline(rawQuery, f = "", cursor = "") {
  let opId = (FALLBACK_OP_IDS.SearchTimeline || [])[0];
  if (!opId) opId = await graphqlOpId("SearchTimeline");
  if (!opId) opId = "KPSo2_UWdOMpPJwjhfT1Qg";

  const productMap = { "": "Top", live: "Latest", user: "People", media: "Photos", list: "Lists" };
  const product = productMap[f] || (["Top", "Latest", "People", "Photos", "Lists"].includes(f) ? f : "Top");

  const vars = {
    rawQuery: rawQuery || "",
    count: 20,
    querySource: "recent_search_click",
    product,
    withGrokTranslatedBio: true,
    withQuickPromoteEligibilityTweetFields: false,
    cursor: cursor || "",
  };
  const qs = new URLSearchParams({
    variables: JSON.stringify(vars),
    features: NOTIFICATIONS_FEATURES_JSON,
  });
  const url = `/i/api/graphql/${opId}/SearchTimeline?${qs}`;
  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: {
        authorization: "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "x-twitter-client-language": "zh-cn",
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-csrf-token": csrf(),
      },
    });
    if (!res.ok) {
      console.warn(`[x-im:search] http ${res.status}`);
      return [];
    }
    const json = await res.json();
    return parseSearchTimeline(json);
  } catch (err) {
    console.warn("[x-im:search] fetch failed:", err);
    return [];
  }
}