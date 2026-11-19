import { pg } from "./page.js";

export function discourseRequire(moduleId) {
  try {
    if (typeof pg.require === "function") return pg.require(moduleId);
  } catch { /* module missing */ }
  return null;
}

export function safeLookup(owner, key) {
  if (!owner || typeof owner.lookup !== "function") return null;
  try {
    return owner.lookup(key);
  } catch {
    return null;
  }
}

export function getEmberOwner() {
  try {
    if (pg.Discourse?.__container__) return pg.Discourse.__container__;

    // Ember.Namespace 反查 Discourse 应用
    const Ember = pg.Ember;
    const namespaces = Ember?.Namespace?.NAMESPACES;
    if (Array.isArray(namespaces)) {
      const app = namespaces.find((n) =>
        n && (n.name === "Discourse" || n.modulePrefix === "discourse" || n.NAMESPACE === "Discourse")
      );
      if (app?.__container__) return app.__container__;
      if (typeof app?.lookup === "function") return app;
    }

    // Ember getOwner 不接受 undefined（会抛 Symbol(OWNER) 读取错误），无 Discourse 时直接跳过
    const app = pg.Discourse;
    const mod = app &&
      (discourseRequire("discourse-common/lib/get-owner") ||
        discourseRequire("discourse/lib/get-owner"));
    if (mod) {
      const owner =
        (typeof mod.getOwnerWithFallback === "function" && mod.getOwnerWithFallback(app)) ||
        (typeof mod.getOwner === "function" && mod.getOwner(app)) ||
        null;
      if (owner) return owner;
    }

    try {
      const appMod = discourseRequire("discourse/app");
      const app = appMod?.default || appMod;
      if (app?.__container__) return app.__container__;
      if (typeof app?.lookup === "function") return app;
    } catch { /* ignore */ }
  } catch (err) {
    // applyTheme 每帧都会走到这里，失败只汇报一次，避免刷屏
    if (!getEmberOwner.warned) {
      getEmberOwner.warned = true;
      console.warn("[linuxdo-im] getEmberOwner failed", err);
    }
  }
  return null;
}

export function getComposerService(owner) {
  return safeLookup(owner, "service:composer") || safeLookup(owner, "controller:composer");
}

export function getTopicModel(owner) {
  const topicController = safeLookup(owner, "controller:topic");
  if (!topicController) return null;
  try {
    return topicController.get?.("model") || topicController.model || null;
  } catch {
    return null;
  }
}

export function findLoadedPost(topic, postNumber) {
  if (!topic || !postNumber) return null;
  try {
    const stream = topic.get?.("postStream") || topic.postStream;
    const posts = stream?.get?.("posts") || stream?.posts || [];
    return [...posts].find((p) =>
      Number(p?.get?.("post_number") ?? p?.post_number) === Number(postNumber)
    ) || null;
  } catch { /* ignore */ }
  return null;
}

export function isComposerOpen() {
  const el = document.querySelector("#reply-control");
  return !!(el && (el.classList.contains("open") || el.classList.contains("fullscreen") || el.classList.contains("edit-title")));
}
