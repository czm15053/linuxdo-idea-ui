import { unwrap, flagTrue } from "./x-dom.js";

function stampOf(raw) {
  const ts = unwrap(raw.createTime) || unwrap(raw.time);
  let time = "刚刚";
  if (ts) {
    const d = new Date(typeof ts === "number" && ts < 1e11 ? ts * 1000 : ts);
    if (!Number.isNaN(d.getTime())) {
      const now = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      if (d.toDateString() === now.toDateString()) time = `${hh}:${mm}`;
      else {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        time = d.toDateString() === yest.toDateString()
          ? `昨天 ${hh}:${mm}`
          : `${d.getMonth() + 1}月${d.getDate()}日`;
      }
    }
  }
  const loc = unwrap(raw.ipLocation) || unwrap(raw.ip) || "";
  return loc ? `${time} · IP:${loc}` : time;
}

export function commentFromRaw(raw, repliedTo) {
  raw = unwrap(raw);
  if (!raw || typeof raw !== "object") return null;
  const user = unwrap(raw.userInfo || raw.user) || {};
  const name = unwrap(user.nickname) || unwrap(user.nickName) || "热心薯友";
  const text = String(unwrap(raw.content) || unwrap(raw.noteText) || "").trim();
  const pics = unwrap(raw.pictures) || unwrap(raw.pictureList) || [];
  const photos = (Array.isArray(pics) ? pics : [])
    .map((p) => (typeof p === "string" ? p : p?.url || p?.urlDefault || ""))
    .filter(Boolean);
  if (!text && !photos.length) return null;
  const uid = String(unwrap(user.userId) || "");
  const target = repliedTo || unwrap(raw.targetComment?.userInfo?.nickname) || "";
  return {
    id: String(unwrap(raw.id) || unwrap(raw.commentId) || Math.random()),
    name,
    handle: uid || name,
    profileHref: uid ? `/user/profile/${uid}` : "",
    avatar: unwrap(user.image) || unwrap(user.avatar) || "",
    text,
    time: stampOf(raw),
    likeCount: String(unwrap(raw.likeCount) || unwrap(raw.likedCount) || ""),
    liked: flagTrue(unwrap(raw.liked)),
    photos,
    repliedTo: target,
    replyTo: target,
    replyRef: target ? { handle: target, href: "", snippet: "" } : null,
    isSub: !!target,
    href: "",
  };
}
