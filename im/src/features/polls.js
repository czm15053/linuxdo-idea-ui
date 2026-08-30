// 话题投票组件（来自 mangen 版）
import { topicPostsMap } from "../state/chat-state.js";
import { csrfToken } from "../bridge/api.js";
import { escapeHtml } from "../utils/html.js";
import { isDarkEffective } from "../theme/color-mode.js";
import { chatHooks } from "../ui/hooks.js";

async function apiVotePoll(postId, pollName, optionIds) {
  if (!postId || !optionIds.length) return null;
  const body = new URLSearchParams();
  body.append("post_id", String(postId));
  body.append("poll_name", String(pollName || "poll"));
  for (const opt of optionIds) {
    body.append("options[]", String(opt));
  }
  const resp = await fetch("/polls/vote", {
    method: "PUT",
    credentials: "same-origin",
    headers: {
      "X-CSRF-Token": csrfToken(),
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
async function apiUndoVotePoll(postId, pollName) {
  if (!postId) return null;
  const body = new URLSearchParams();
  body.append("post_id", String(postId));
  body.append("poll_name", String(pollName || "poll"));
  const resp = await fetch("/polls/vote", {
    method: "DELETE",
    credentials: "same-origin",
    headers: {
      "X-CSRF-Token": csrfToken(),
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
function applyPollResult(poll, pollData) {
  if (!poll || !pollData) return;
  const options = pollData.options || [];
  const totalVotes = options.reduce((sum, o) => sum + (Number(o.votes) || 0), 0);
  const infoNumber = poll.querySelector(".poll-info .info-number");
  if (infoNumber) infoNumber.textContent = String(pollData.voters != null ? pollData.voters : totalVotes);

  for (const opt of options) {
    const optEl = poll.querySelector(`.im-poll-option[data-poll-option-id="${opt.id}"]`);
    if (!optEl) continue;
    const votes = Number(opt.votes) || 0;
    const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    const countEl = optEl.querySelector(".im-poll-count");
    if (countEl) {
      countEl.textContent = `${votes} 票 (${pct}%)`;
      countEl.style.display = "";
    }
    const barEl = optEl.querySelector(".im-poll-bar");
    if (barEl) {
      barEl.style.width = `${pct}%`;
    }
  }
}
function getVotedOptionIds(postId, pollName, postData) {
  if (postData && postData.polls_votes && postData.polls_votes[pollName]) {
    const v = postData.polls_votes[pollName];
    return Array.isArray(v) ? v.map(String) : [String(v)];
  }
  try {
    const cache = localStorage.getItem(`im_poll_${postId}_${pollName}`);
    if (cache) return JSON.parse(cache).map(String);
  } catch { /* ignore */ }
  return [];
}
function saveVotedOptionIds(postId, pollName, optionIds) {
  try {
    localStorage.setItem(`im_poll_${postId}_${pollName}`, JSON.stringify(optionIds));
  } catch { /* ignore */ }
}
function clearVotedOptionIds(postId, pollName) {
  try {
    localStorage.removeItem(`im_poll_${postId}_${pollName}`);
  } catch { /* ignore */ }
}
function initPollComponent(poll, postData) {
  if (!poll || poll.querySelector(".im-poll-options")) return;

  const items = poll.querySelectorAll("li[data-poll-option-id]");
  if (!items.length) return;

  const msg = poll.closest(".im-msg");
  const postId = msg ? msg.dataset.postId : null;
  const isDark = isDarkEffective();
  const pollName = poll.dataset.pollName || "poll";
  const isMultiple = poll.dataset.pollType === "multiple";
  const pollInfo = postData && postData.polls && postData.polls.find((p) => p.name === pollName);
  const optionsData = (pollInfo && pollInfo.options) || [];
  const totalVotes = optionsData.reduce((sum, o) => sum + (Number(o.votes) || 0), 0);
  const totalVoters = (pollInfo && pollInfo.voters != null) ? pollInfo.voters : totalVotes;

  const infoNumber = poll.querySelector(".poll-info .info-number");
  if (infoNumber && totalVoters > 0) {
    infoNumber.textContent = String(totalVoters);
  }

  const votedOptionIds = getVotedOptionIds(postId, pollName, postData);
  const hasVoted = votedOptionIds.length > 0;

  poll.style.cssText = `
    background: ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"} !important;
    border: 1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} !important;
    border-radius: 10px !important;
    padding: 14px 16px !important;
    margin: 12px 0 !important;
    user-select: none !important;
    display: block !important;
  `;

  const optionsBox = document.createElement("div");
  optionsBox.className = "im-poll-options";
  optionsBox.style.cssText = "display:flex !important; flex-direction:column !important; gap:8px !important; margin-bottom:10px !important;";

  items.forEach((li) => {
    const optId = li.dataset.pollOptionId;
    let rawText = (li.textContent || "").trim();
    rawText = rawText.replace(/\s*\d+\s*票\s*\(\d+%\)$/, "").trim();

    const matchedOpt = optionsData.find((o) => o.id === optId);
    const votes = matchedOpt ? Number(matchedOpt.votes) || 0 : 0;
    const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
    const countText = totalVotes > 0 ? `${votes} 票 (${pct}%)` : "";
    const isSelected = votedOptionIds.includes(optId);

    const optCard = document.createElement("div");
    optCard.className = `im-poll-option${isSelected ? " selected" : ""}`;
    optCard.dataset.pollOptionId = optId;
    optCard.style.cssText = `
      display: flex !important;
      align-items: center !important;
      padding: 10px 14px !important;
      border-radius: 8px !important;
      background: ${isSelected ? (isDark ? "rgba(26, 135, 255, 0.18)" : "rgba(26, 135, 255, 0.08)") : (isDark ? "#23262E" : "#FFFFFF")} !important;
      border: 1.5px solid ${isSelected ? "#1A87FF" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")} !important;
      cursor: pointer !important;
      position: relative !important;
      overflow: hidden !important;
      transition: all 0.18s ease !important;
    `;

    optCard.innerHTML = `
      <span class="im-poll-radio" style="
        width: 18px !important;
        height: 18px !important;
        min-width: 18px !important;
        border-radius: ${isMultiple ? "4px" : "50%"} !important;
        border: 2px solid ${isSelected ? "#1A87FF" : (isDark ? "#7C8290" : "#8A8F99")} !important;
        background: ${isSelected ? "#1A87FF" : "transparent"} !important;
        margin-right: 12px !important;
        flex-shrink: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-sizing: border-box !important;
      ">${isSelected ? `<span style="width:6px; height:6px; border-radius:${isMultiple ? "1px" : "50%"}; background:#FFFFFF; display:block;"></span>` : ""}</span>
      <span class="im-poll-title" style="
        flex: 1 !important;
        font-size: 13.5px !important;
        font-weight: 500 !important;
        color: ${isDark ? "#E6E8EB" : "#1F2329"} !important;
        line-height: 1.4 !important;
        z-index: 1 !important;
      ">${escapeHtml(rawText)}</span>
      <span class="im-poll-count" style="
        font-size: 12px !important;
        font-weight: 600 !important;
        color: ${isDark ? "#9AA0AE" : "#646A73"} !important;
        margin-left: 10px !important;
        z-index: 1 !important;
        white-space: nowrap !important;
        ${countText ? "" : "display:none !important;"}
      ">${escapeHtml(countText)}</span>
      <div class="im-poll-bar" style="
        position: absolute !important;
        left: 0 !important; top: 0 !important; bottom: 0 !important;
        background: ${isDark ? "rgba(43, 140, 255, 0.2)" : "rgba(26, 135, 255, 0.14)"} !important;
        pointer-events: none !important;
        width: ${pct}% !important;
        transition: width 0.35s ease !important;
        z-index: 0 !important;
      "></div>
    `;

    optCard.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isMultiple) {
        optionsBox.querySelectorAll(".im-poll-option").forEach((el) => {
          if (el !== optCard) {
            el.classList.remove("selected");
            el.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
            el.style.background = isDark ? "#23262E" : "#FFFFFF";
            const r = el.querySelector(".im-poll-radio");
            if (r) {
              r.style.background = "transparent";
              r.style.borderColor = isDark ? "#7C8290" : "#8A8F99";
              r.innerHTML = "";
            }
          }
        });
      }

      const toggled = optCard.classList.toggle("selected");
      const radio = optCard.querySelector(".im-poll-radio");
      if (toggled) {
        optCard.style.borderColor = "#1A87FF";
        optCard.style.background = isDark ? "rgba(26, 135, 255, 0.18)" : "rgba(26, 135, 255, 0.08)";
        if (radio) {
          radio.style.background = "#1A87FF";
          radio.style.borderColor = "#1A87FF";
          radio.innerHTML = `<span style="width:6px; height:6px; border-radius:${isMultiple ? "1px" : "50%"}; background:#FFFFFF; display:block;"></span>`;
        }
      } else {
        optCard.style.borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
        optCard.style.background = isDark ? "#23262E" : "#FFFFFF";
        if (radio) {
          radio.style.background = "transparent";
          radio.style.borderColor = isDark ? "#7C8290" : "#8A8F99";
          radio.innerHTML = "";
        }
      }

      const hasSelected = !!optionsBox.querySelector(".im-poll-option.selected");
      const submitBtn = poll.querySelector(".im-poll-submit-btn");
      if (submitBtn && submitBtn.textContent === "投票") {
        submitBtn.disabled = !hasSelected;
        submitBtn.style.opacity = hasSelected ? "1" : "0.5";
        submitBtn.style.cursor = hasSelected ? "pointer" : "not-allowed";
      }
    });

    optionsBox.appendChild(optCard);
  });

  const ul = poll.querySelector("ul");
  if (ul) {
    ul.replaceWith(optionsBox);
  } else {
    poll.appendChild(optionsBox);
  }

  if (!poll.querySelector(".im-poll-actions")) {
    const actions = document.createElement("div");
    actions.className = "im-poll-actions";
    actions.style.cssText = "display:flex !important; align-items:center !important; gap:12px !important; margin-top:12px !important; padding-top:10px !important; border-top:1px dashed rgba(255,255,255,0.1) !important;";

    actions.innerHTML = `
      <button type="button" class="im-poll-submit-btn" ${hasVoted ? "" : "disabled"} style="
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 32px !important;
        line-height: 1 !important;
        padding: 0 20px !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        cursor: ${hasVoted ? "default" : "not-allowed"} !important;
        border: none !important;
        background: #1A87FF !important;
        color: #FFFFFF !important;
        opacity: ${hasVoted ? "1" : "0.5"} !important;
        box-sizing: border-box !important;
        transition: all 0.2s !important;
      ">${hasVoted ? "已投票" : "投票"}</button>
      <button type="button" class="im-poll-undo-btn" style="
        display: ${hasVoted ? "inline-flex" : "none"} !important;
        align-items: center !important;
        justify-content: center !important;
        height: 32px !important;
        line-height: 1 !important;
        padding: 0 16px !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        cursor: pointer !important;
        box-sizing: border-box !important;
        border: 1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"} !important;
        background: transparent !important;
        color: ${isDark ? "#A0A5B2" : "#646A73"} !important;
      ">撤销投票</button>
      <span class="im-poll-status-tip" style="font-size:12px; color:${isDark ? "#8A8F99" : "#8F959E"}; margin-left:8px;">${hasVoted ? "✓ 您已参与投票" : ""}</span>
    `;
    poll.appendChild(actions);

    const submitBtn = actions.querySelector(".im-poll-submit-btn");
    const undoBtn = actions.querySelector(".im-poll-undo-btn");
    const tip = actions.querySelector(".im-poll-status-tip");

    submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (submitBtn.textContent === "已投票") return;

      const selected = Array.from(optionsBox.querySelectorAll(".im-poll-option.selected")).map((el) => el.dataset.pollOptionId);
      if (!selected.length || !postId) return;

      submitBtn.disabled = true;
      submitBtn.textContent = "正在提交…";
      try {
        const res = await apiVotePoll(postId, pollName, selected);
        saveVotedOptionIds(postId, pollName, selected);
        submitBtn.textContent = "已投票";
        submitBtn.style.cursor = "default";
        submitBtn.style.opacity = "1";
        if (undoBtn) undoBtn.style.display = "inline-flex";
        if (tip) tip.textContent = "✓ 投票成功";
        if (res && res.poll) applyPollResult(poll, res.poll);
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "投票";
        if (tip) tip.textContent = `投票失败: ${err.message}`;
        console.error(err);
      }
    });

    undoBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      undoBtn.disabled = true;
      try {
        const res = await apiUndoVotePoll(postId, pollName);
        clearVotedOptionIds(postId, pollName);
        undoBtn.style.display = "none";
        undoBtn.disabled = false;
        submitBtn.textContent = "投票";
        const hasSelected = !!optionsBox.querySelector(".im-poll-option.selected");
        submitBtn.disabled = !hasSelected;
        submitBtn.style.opacity = hasSelected ? "1" : "0.5";
        submitBtn.style.cursor = hasSelected ? "pointer" : "not-allowed";
        if (tip) tip.textContent = "已撤销投票";
        if (res && res.poll) applyPollResult(poll, res.poll);
      } catch (err) {
        undoBtn.disabled = false;
        if (tip) tip.textContent = "撤销失败";
        console.error(err);
      }
    });
  }
}
function enhanceAllPolls(container) {
  if (!container) return;
  try {
    const polls = container.querySelectorAll(".poll");
    for (const poll of polls) {
      try {
        const msg = poll.closest(".im-msg");
        const postNum = msg ? Number(msg.dataset.postNumber) : null;
        const postData = postNum ? topicPostsMap.get(postNum) : null;
        initPollComponent(poll, postData);
      } catch (innerErr) {
        console.warn("[linuxdo-im] initPollComponent warning:", innerErr);
      }
    }
  } catch (err) {
    console.warn("[linuxdo-im] enhanceAllPolls warning:", err);
  }
}


/* ============================== 小火箭跟评（来自 mangen 版） ============================== */


// 气泡内投票渲染入口（chat-panel 经 chatHooks 调用；自注册，入口 import 即生效）
Object.assign(chatHooks, { enhancePolls: enhanceAllPolls });
