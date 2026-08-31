#!/usr/bin/env node
import fs from "node:fs";

const output = fs.readFileSync("dist/linuxdo-im.user.js", "utf8");

const checks = [
  ["function ensureRail(", 1],
  ["function ensureRailDingtalk(", 1],
  ["function ensureRailFeishu(", 1],
  ["function syncRailDingtalk(", 1],
  ["function syncRailFeishu(", 1],
  ["function ensureNotifStrip(", 1],
  ["function ensureDarkModeToggle(", 1],
  ["function syncDarkModeToggle(", 1],
  ["function disguiseAvatarForTopicDingtalk(", 1],
  ["function disguiseAvatarForTopicFeishu(", 1],
  ["function renderPins(", 1],
  ["function migratePrefs(", 1],
  ["function skinCss(", 1],
  ["function ensureSkinToggle(", 1],
  ["const LIST_NAV_KEY", 1],
  ["const MASK_AVATAR_KEY", 1],
  ["const MASK_TITLE_KEY", 1],
  ["const HIDE_CAT_TAGS_KEY", 1],
  ["const ORG_NAME_KEY", 1],
  ["const chatState", 1],
  ["const listState", 1],
  ["const composerState", 1],
  ["const ICONS", 1],
];

let ok = true;
for (const [needle, want] of checks) {
  const n = output.split(needle).length - 1;
  if (n !== want) {
    console.error(`self-check failed: "${needle}" occurs ${n}x, want ${want}x`);
    ok = false;
  }
}

const stray = (output.match(/class="[^"]*(?:dingtalk|feishu|wecom)-[^"]*"/g) || []).filter(
  (s) => !s.includes("linuxdo-")
);
if (stray.length) {
  console.error("stray brand classes remain: " + stray.slice(0, 5).join(" | "));
  ok = false;
}

if (ok) {
  console.log("self-check passed");
  process.exit(0);
} else {
  process.exit(1);
}
