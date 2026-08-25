// ==UserScript==
// @name         Linux DO · JetBrains / Darcula 外观
// @namespace    https://linux.do/
// @version      0.2.0
// @description  将 Linux DO 的主页与话题页换成 JetBrains IDE / Darcula 风格（默认 GoLand，可切换 IDEA / PyCharm）。仅改变外观，保留站点原有内容与交互。
// @author       czm15053
// @match        https://linux.do/*
// @icon         https://linux.do/favicon.ico
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  const STYLE_ID = "linuxdo-idea-theme";
  const FAVICON_ID = "idea-favicon";
  const HOME_CLASS = "idea-ide-home";
  const TOPIC_CLASS = "idea-ide-topic";
  const DARK_CLASS = "idea-dark";
  const POST_ROWS_THEME_CLASS = "idea-post-rows-themed";
  const POST_ROWS_MODE_KEY = "linuxdo-idea-post-rows-mode";
  const PRODUCT_KEY = "linuxdo-idea-product";

  let faviconObserver;
  let postRowsModeFallback = "ide";
  let topicToolsCloseTimer;
  let topicToolsOutsideBound = false;

  // Brand marks adapted from Wikimedia Commons (JetBrains product icons).
  const IDEA_MARK_SVG = (idPrefix, sizeAttr) => `<svg ${sizeAttr} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${idPrefix}-a" x1="0" y1="8" x2="24" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0.1" stop-color="#FC801D"/>
        <stop offset="0.59" stop-color="#FE2857"/>
      </linearGradient>
      <linearGradient id="${idPrefix}-b" x1="6" y1="58" x2="62" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0.21" stop-color="#FE2857"/>
        <stop offset="0.7" stop-color="#007EFF"/>
      </linearGradient>
    </defs>
    <path fill="#FF8100" d="M14 6H4C1.8 6 0 7.8 0 10v11.5c0 1.2.5 2.3 1.4 3.1L38.5 56.8c.7.6 1.7 1 2.7 1H53c2.2 0 4-1.8 4-4V42.2c0-1.2-.5-2.3-1.4-3.1L17.6 6.9C16.9 6.3 15.9 6 14.9 6H14z"/>
    <path fill="url(#${idPrefix}-a)" d="M14.5 6H4C1.8 6 0 7.8 0 10v13c0 .2 0 .4.05.6L5.2 59.5C5.5 61.5 7.2 63 9.2 63H25c2.2 0 4-1.8 4-4l-.01-18.3c0-.45-.07-.88-.21-1.3L18.4 8.7C17.85 7.05 16.3 6 14.55 6h-.05z"/>
    <path fill="url(#${idPrefix}-b)" d="M60 0H26c-1.6 0-3.1 1-3.75 2.5L6.2 39.2c-.22.5-.33 1.05-.33 1.6V59c0 2.2 1.8 4 4 4h18c.8 0 1.6-.24 2.25-.7L61.8 41.2c1.15-.75 1.85-2.05 1.85-3.4V4c0-2.2-1.8-4-4-4H60z"/>
    <rect x="12" y="12" width="40" height="40" fill="#000"/>
    <path fill="#fff" d="M17 29.4h3v-9.8H17V17h8.8v2.6h-3v9.8h3V32H17v-2.6z"/>
    <path fill="#fff" d="M27.3 29.3h2.2c1.3 0 2.2-.9 2.2-2.2V17h2.9v10.3c0 2.7-1.8 4.7-4.8 4.7h-2.5v-2.7z"/>
    <rect x="17" y="44" width="16" height="3" fill="#fff"/>
  </svg>`;

  const PYCHARM_MARK_SVG = (idPrefix, sizeAttr) => `<svg ${sizeAttr} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${idPrefix}-a" x1="8" y1="64" x2="60" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0.1" stop-color="#00D886"/>
        <stop offset="0.59" stop-color="#F0EB18"/>
      </linearGradient>
      <linearGradient id="${idPrefix}-b" x1="58" y1="58" x2="2" y2="2" gradientUnits="userSpaceOnUse">
        <stop offset="0.3" stop-color="#F0EB18"/>
        <stop offset="0.7" stop-color="#00C4F4"/>
      </linearGradient>
    </defs>
    <path fill="#00D886" d="M6 48l.01 11.9C6.01 62.1 7.8 64 10 64h11.5c1.2 0 2.3-.52 3.1-1.42L57.2 24.4c.63-.74.98-1.68.98-2.65V9.9c0-2.25-1.82-4.07-4.07-4.07H42.6c-1.19 0-2.32.52-3.09 1.42L6.8 45.4c-.63.74-.98 1.68-.98 2.65z"/>
    <path fill="url(#${idPrefix}-a)" d="M6 49.5v10.4C6 62.1 7.8 64 10 64h13c.19 0 .38-.01.57-.04l36.9-5.28c2.01-.29 3.5-2 3.5-4.03V39c0-2.25-1.82-4.07-4.07-4.07l-18.54.01c-.44 0-.87.07-1.29.21L8.6 45.6C6.94 46.16 5.82 47.72 5.82 49.47V49.5H6z"/>
    <path fill="url(#${idPrefix}-b)" d="M0 4.07V38c0 1.63.97 3.1 2.47 3.74L40 57.85c.51.22 1.05.33 1.6.33h18.4c2.25 0 4.07-1.82 4.07-4.07V36.1c0-.8-.24-1.59-.69-2.26L41.9 1.81C41.16.68 39.89 0 38.52 0H4.07C1.82 0 0 1.82 0 4.07z"/>
    <rect x="12" y="12" width="40" height="40" fill="#000"/>
    <path fill="#fff" d="M17.1 17h6.9c3.9 0 6.3 2.3 6.3 5.7v.1c0 3.8-2.9 5.8-6.6 5.8h-2.8V37h-3.8V17zm6.5 8.4c1.8 0 2.9-1.1 2.9-2.5v-.1c0-1.6-1.1-2.5-2.9-2.5h-2.7v5.1h2.7z"/>
    <path fill="#fff" d="M33.4 31.2c1.17.67 2.47 1.01 3.9 1.01 1.21 0 2.33-.23 3.34-.68 1.02-.45 1.86-1.08 2.53-1.89.68-.81 1.13-1.75 1.36-2.8h-3.07c-.2.54-.5 1.02-.9 1.44-.39.41-.87.72-1.43.94-.56.22-1.16.33-1.82.33-.89 0-1.69-.22-2.4-.66-.72-.44-1.28-1.05-1.69-1.82-.4-.78-.6-1.66-.6-2.63s.2-1.84.6-2.62c.41-.78.97-1.39 1.69-1.83.71-.44 1.51-.66 2.4-.66.66 0 1.26.11 1.82.33.56.22 1.04.54 1.43.95.4.41.7.88.9 1.43h3.07c-.23-1.05-.68-1.98-1.36-2.79-.67-.81-1.51-1.45-2.53-1.9-1.01-.45-2.13-.67-3.34-.67-1.44 0-2.74.34-3.9 1.02-1.17.67-2.08 1.6-2.75 2.79-.66 1.18-1 2.5-1 3.95 0 1.46.33 2.78 1 3.97.66 1.18 1.58 2.11 2.75 2.78z"/>
    <rect x="17" y="44" width="16" height="3" fill="#fff"/>
  </svg>`;

  const GOLAND_MARK_SVG = (idPrefix, sizeAttr) => `<svg ${sizeAttr} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="${idPrefix}-a" x1="64.391" x2="39.607" y1="56.329" y2="2.874" gradientUnits="userSpaceOnUse">
        <stop offset="0.24" stop-color="#00D886"/>
        <stop offset="0.51" stop-color="#007DFE"/>
      </linearGradient>
      <linearGradient id="${idPrefix}-b" x1="59.676" x2="1.08" y1="4.067" y2="62.663" gradientUnits="userSpaceOnUse">
        <stop offset="0.27" stop-color="#007DFE"/>
        <stop offset="0.7" stop-color="#D249FC"/>
      </linearGradient>
    </defs>
    <path fill="#00D886" d="M47.55 58h12.259a4.125 4.125 0 0 0 4.124-4.19l-.176-11.044a4.13 4.13 0 0 0-1.44-3.066L24.159 6.993A4.13 4.13 0 0 0 21.474 6H10.125A4.125 4.125 0 0 0 6 10.125v11.003c0 1.19.514 2.321 1.409 3.105l37.425 32.746A4.12 4.12 0 0 0 47.55 58"/>
    <path fill="url(#${idPrefix}-a)" d="M49.013 58h10.862A4.125 4.125 0 0 0 64 53.875V41.309q0-.3-.044-.598L58.508 3.527A4.124 4.124 0 0 0 54.427 0H39.029a4.125 4.125 0 0 0-4.125 4.126l.005 18.505c0 .425.066.848.195 1.253l9.979 31.246a4.13 4.13 0 0 0 3.93 2.87"/>
    <path fill="url(#${idPrefix}-b)" d="M4.125 64h34.128a4.13 4.13 0 0 0 3.8-2.52L57.85 24.057c.219-.518.33-1.076.324-1.638l-.15-18.329A4.124 4.124 0 0 0 53.9 0H36.234c-.805 0-1.593.236-2.266.678L1.86 21.787A4.13 4.13 0 0 0 0 25.234v34.641A4.125 4.125 0 0 0 4.125 64"/>
    <rect x="12" y="12" width="40" height="40" fill="#000"/>
    <path fill="#fff" d="M19.748 31.243a7.3 7.3 0 0 1-2.743-2.787q-.997-1.774-.997-3.961c0-2.187.332-2.778.997-3.96s1.58-2.112 2.743-2.787q1.747-1.013 3.902-1.014 1.747 0 3.222.622a6.9 6.9 0 0 1 2.486 1.747 6.4 6.4 0 0 1 1.42 2.594h-3.13a3.9 3.9 0 0 0-.926-1.228q-.584-.52-1.367-.803c-.783-.283-1.083-.284-1.683-.284q-1.33 0-2.402.664a4.6 4.6 0 0 0-1.677 1.828q-.606 1.163-.606 2.62c0 1.457.202 1.846.606 2.621a4.6 4.6 0 0 0 1.677 1.828q1.072.664 2.402.664 1.232 0 2.235-.461t1.591-1.276a3.3 3.3 0 0 0 .633-1.833l.01.31h-3.526v-2.304h6.357v1.18q0 1.982-.96 3.585a6.9 6.9 0 0 1-2.626 2.525q-1.666.921-3.736.921c-2.07 0-2.737-.337-3.902-1.013zM36.271 31.243a7.3 7.3 0 0 1-2.755-2.787q-1.002-1.774-1.002-3.961c0-2.187.333-2.778 1.002-3.96a7.3 7.3 0 0 1 2.755-2.787q1.752-1.013 3.918-1.014c1.443 0 2.738.338 3.907 1.013a7.3 7.3 0 0 1 2.749 2.787q.996 1.774.997 3.961c0 2.187-.333 2.778-.997 3.96s-1.581 2.113-2.75 2.788q-1.752 1.013-3.906 1.013c-1.437 0-2.75-.338-3.918-1.013m6.308-2.23q1.062-.67 1.662-1.854t.6-2.664-.6-2.664-1.662-1.854-2.39-.67-2.395.67a4.6 4.6 0 0 0-1.672 1.854q-.606 1.185-.606 2.664t.606 2.664 1.672 1.854 2.395.67q1.33 0 2.39-.67"/>
    <rect x="17" y="44" width="16" height="3" fill="#fff"/>
  </svg>`;

  const PRODUCT_ORDER = ["goland", "idea", "pycharm"];
  const DEFAULT_PRODUCT_ID = "goland";

  const PRODUCTS = {
    goland: {
      id: "goland",
      name: "GoLand",
      accent: "#00D886",
      ext: "go",
      contextRoot: "cmd",
      newFileLabel: "New File",
      breadcrumbFileLeaf: true,
      indent: "\t",
      comment: {
        replyComment: "// ",
        bodyComment: "// ",
        quoteComment: "// > ",
        line: "//"
      },
      paintBody: "raw-string",
      statusText: "UTF-8  ·  tabs  ·  Go 1.26  ·  Darcula  ·  Linux DO",
      statusLang: "Go",
      tabIcon: "linear-gradient(135deg, #00D886, #007DFE)",
      menus: [
        "File",
        "Edit",
        "View",
        "Navigate",
        "Code",
        "Refactor",
        "Run",
        "Tools",
        "VCS",
        "Window",
        "Help"
      ],
      stripLeft: [
        { label: "Project", icon: "folder", active: true },
        { label: "Commit", icon: "commit" },
        { label: "Structure", icon: "structure" }
      ],
      stripRight: [
        { label: "Go", icon: "go" },
        { label: "Database", icon: "database" },
        { label: "AI", icon: "ai" }
      ],
      sidebarAliases: {
        categories: "cmd",
        tags: "internal",
        chat: "testdata",
        dms: "scratch",
        resources: "externalLibraries"
      },
      mark: GOLAND_MARK_SVG,
      headerTopic({ name, floor, time, title, postNumber }) {
        const topic = String(title || "").replace(/\s+/g, " ").trim() || "未命名话题";
        const n = goFloorNumber(floor, postNumber);
        const meta = [
          name ? `作者 ${name}` : "",
          n ? `楼层 ${n}` : "",
          time ? `发表于 ${time}` : ""
        ]
          .filter(Boolean)
          .join("，");
        const lines = [
          `<span class="idea-cmt">// Package topics 记录「${escapeHtml(topic)}」。</span>`
        ];
        if (meta) lines.push(`<span class="idea-cmt">// ${escapeHtml(meta)}。</span>`);
        lines.push(`<span class="idea-kw">package</span> topics`);
        return lines;
      },
      headerReply({ name, floor, time, replyTo, postNumber }) {
        const n = goFloorNumber(floor, postNumber);
        const bits = [
          name ? `${name} 的 ${n} 楼` : `${n} 楼`,
          time,
          replyTo ? `回复 ${replyTo}` : ""
        ]
          .filter(Boolean)
          .join("，");
        return [
          `<span class="idea-kw">package</span> topics`,
          ``,
          bits ? `<span class="idea-cmt">// ${escapeHtml(bits)}。</span>` : ``
        ];
      },
      footerTopic({ name, floor, time, postNumber, body }) {
        const n = goFloorNumber(floor, postNumber);
        return [
          ``,
          `<span class="idea-kw">type</span> <span class="idea-fn">Post</span> <span class="idea-kw">struct</span> {`,
          `\tAuthor, At, ReplyTo, Body <span class="idea-kw">string</span>`,
          `\tFloor                     <span class="idea-kw">int</span>`,
          `}`,
          ``,
          `<span class="idea-kw">var</span> Topic = <span class="idea-fn">Post</span>{`,
          `\tAuthor: ${goStringLiteral(name || "")},`,
          `\tFloor:  ${escapeHtml(n)},`,
          ...(time ? [`\tAt:     ${goStringLiteral(time)},`] : []),
          ...goBodyFieldLines(body),
          `}`
        ];
      },
      footerReply({ name, floor, time, replyTo, postNumber, body }) {
        const ident = goPostIdent(name, postNumber);
        const n = goFloorNumber(floor, postNumber);
        return [
          `<span class="idea-kw">var</span> ${escapeHtml(ident)} = <span class="idea-fn">Post</span>{`,
          `\tAuthor:  ${goStringLiteral(name || "anon")},`,
          `\tFloor:   ${escapeHtml(n)},`,
          ...(time ? [`\tAt:      ${goStringLiteral(time)},`] : []),
          ...(replyTo ? [`\tReplyTo: ${goStringLiteral(replyTo)},`] : []),
          ...goBodyFieldLines(body),
          `}`
        ];
      }
    },
    idea: {
      id: "idea",
      name: "IntelliJ IDEA",
      accent: "#4A9FD8",
      ext: "java",
      contextRoot: "topics",
      newFileLabel: "New Class",
      breadcrumbFileLeaf: false,
      indent: "  ",
      comment: {
        replyComment: "// ",
        bodyComment: "  // ",
        quoteComment: "// > ",
        line: "//"
      },
      statusText: "UTF-8  ·  4 spaces  ·  Java  ·  Darcula  ·  Linux DO",
      statusLang: "Java",
      tabIcon: "linear-gradient(135deg, #CC7832, #6A8759)",
      menus: [
        "File",
        "Edit",
        "View",
        "Navigate",
        "Code",
        "Refactor",
        "Build",
        "Run",
        "Tools",
        "VCS",
        "Window",
        "Help"
      ],
      stripLeft: [
        { label: "Project", icon: "folder", active: true },
        { label: "Commit", icon: "commit" },
        { label: "Bookmarks", icon: "bookmark" }
      ],
      stripRight: [
        { label: "Maven", icon: "maven" },
        { label: "Database", icon: "database" },
        { label: "AI", icon: "ai" }
      ],
      sidebarAliases: {
        categories: "directories",
        tags: "packages",
        chat: "resources",
        dms: "scratch",
        resources: "externalLibraries"
      },
      mark: IDEA_MARK_SVG,
      headerTopic({ name, floor, time, stem }) {
        return [
          `<span class="idea-kw">package</span> <span class="idea-str">linux.do.topics</span>;`,
          ``,
          `<span class="idea-kw">import</span> <span class="idea-str">community.discourse.*</span>;`,
          ``,
          `<span class="idea-cmt">/**</span>`,
          `<span class="idea-cmt"> * <span class="idea-ann">@author</span> ${escapeHtml(name)}</span>`,
          floor
            ? `<span class="idea-cmt"> * <span class="idea-ann">@floor</span> ${escapeHtml(floor)}</span>`
            : `<span class="idea-cmt"> *</span>`,
          time
            ? `<span class="idea-cmt"> * <span class="idea-ann">@since</span> ${escapeHtml(time)}</span>`
            : `<span class="idea-cmt"> *</span>`,
          `<span class="idea-cmt"> */</span>`,
          `<span class="idea-kw">public class</span> <span class="idea-fn">${escapeHtml(stem)}</span> {`,
          ``
        ];
      },
      headerReply({ methodName, meta }) {
        return [
          ``,
          `<span class="idea-cmt">// ${escapeHtml(meta)}</span>`,
          `<span class="idea-ann">@Reply</span>`,
          `<span class="idea-kw">void</span> <span class="idea-fn">${escapeHtml(methodName)}</span>() {`
        ];
      },
      footerTopic() {
        return [``, `<span class="idea-kw">}</span> <span class="idea-cmt">// end of topic</span>`];
      },
      footerReply() {
        return [`<span class="idea-kw">}</span>`];
      },
      replyPlain: [
        (indent, str, body) =>
          `${indent}<span class="idea-fn">log</span>.<span class="idea-fn">info</span>(${str(body)});`,
        (indent, str, body) => `${indent}notes.<span class="idea-fn">add</span>(${str(body)});`,
        (indent, str, body) =>
          `${indent}<span class="idea-kw">assert</span> ${str(body)}.<span class="idea-fn">length</span>() > 0;`,
        (indent, str, body) => `${indent}ctx.<span class="idea-fn">reply</span>(${str(body)});`,
        (indent, str, body) => `${indent}<span class="idea-kw">var</span> msg = ${str(body)};`
      ],
      replyLink: (indent, str, body) =>
        `${indent}ctx.<span class="idea-fn">open</span>(${str(body)});`,
      replyList: (indent, str, body) =>
        `${indent}items.<span class="idea-fn">add</span>(${str(body)});`,
      replyQuote: (indent, comment, body) =>
        `${indent}<span class="idea-cmt">${comment}quoted: ${body}</span>`,
      replyFillers: [
        `  <span class="idea-kw">if</span> (msg == <span class="idea-kw">null</span> || msg.<span class="idea-fn">isBlank</span>()) {`,
        `    <span class="idea-kw">return</span>;`,
        `  }`,
        `  ctx.<span class="idea-fn">touch</span>();`,
        `  notes.<span class="idea-fn">sort</span>(<span class="idea-kw">null</span>);`,
        `  Metrics.<span class="idea-fn">inc</span>(<span class="idea-str">"reply"</span>);`
      ]
    },
    pycharm: {
      id: "pycharm",
      name: "PyCharm",
      accent: "#21D789",
      ext: "py",
      contextRoot: "src",
      newFileLabel: "New File",
      breadcrumbFileLeaf: true,
      indent: "    ",
      comment: {
        replyComment: "# ",
        bodyComment: "    # ",
        quoteComment: "# > ",
        line: "#"
      },
      statusText: "UTF-8  ·  4 spaces  ·  Python  ·  Darcula  ·  Linux DO",
      statusLang: "Python",
      tabIcon: "linear-gradient(135deg, #3572A5, #21D789)",
      menus: [
        "File",
        "Edit",
        "View",
        "Navigate",
        "Code",
        "Refactor",
        "Run",
        "Tools",
        "VCS",
        "Window",
        "Help"
      ],
      stripLeft: [
        { label: "Project", icon: "folder", active: true },
        { label: "Structure", icon: "structure" },
        { label: "Bookmarks", icon: "bookmark" }
      ],
      stripRight: [
        { label: "Python", icon: "python" },
        { label: "Database", icon: "database" },
        { label: "AI", icon: "ai" }
      ],
      sidebarAliases: {
        categories: "src",
        tags: "packages",
        chat: "notebooks",
        dms: "scratch",
        resources: "externalLibraries"
      },
      mark: PYCHARM_MARK_SVG,
      headerTopic({ name, floor, time, stem }) {
        return [
          `<span class="idea-cmt">"""linux.do.topics</span>`,
          ``,
          `<span class="idea-cmt"><span class="idea-ann">@author</span> ${escapeHtml(name)}</span>`,
          floor
            ? `<span class="idea-cmt"><span class="idea-ann">@floor</span> ${escapeHtml(floor)}</span>`
            : ``,
          time
            ? `<span class="idea-cmt"><span class="idea-ann">@since</span> ${escapeHtml(time)}</span>`
            : ``,
          `<span class="idea-cmt">"""</span>`,
          ``,
          `<span class="idea-kw">from</span> <span class="idea-str">community.discourse</span> <span class="idea-kw">import</span> *`,
          ``,
          `<span class="idea-kw">class</span> <span class="idea-fn">${escapeHtml(stem)}</span>:`,
          ``
        ];
      },
      headerReply({ methodName, meta }) {
        return [
          ``,
          `<span class="idea-cmt"># ${escapeHtml(meta)}</span>`,
          `<span class="idea-kw">def</span> <span class="idea-fn">${escapeHtml(methodName)}</span>():`
        ];
      },
      footerTopic() {
        return [``, `<span class="idea-cmt"># end of topic</span>`];
      },
      footerReply() {
        return [];
      },
      replyPlain: [
        (indent, str, body) =>
          `${indent}<span class="idea-fn">logger</span>.<span class="idea-fn">info</span>(${str(body)})`,
        (indent, str, body) => `${indent}notes.<span class="idea-fn">append</span>(${str(body)})`,
        (indent, str, body) => `${indent}<span class="idea-kw">assert</span> ${str(body)}`,
        (indent, str, body) => `${indent}ctx.<span class="idea-fn">reply</span>(${str(body)})`,
        (indent, str, body) => `${indent}msg = ${str(body)}`
      ],
      replyLink: (indent, str, body) => `${indent}ctx.<span class="idea-fn">open</span>(${str(body)})`,
      replyList: (indent, str, body) =>
        `${indent}items.<span class="idea-fn">append</span>(${str(body)})`,
      replyQuote: (indent, comment, body) =>
        `${indent}<span class="idea-cmt">${comment}quoted: ${body}</span>`,
      replyFillers: [
        `    <span class="idea-kw">if</span> <span class="idea-kw">not</span> msg:`,
        `        <span class="idea-kw">return</span>`,
        `    ctx.<span class="idea-fn">touch</span>()`,
        `    notes.<span class="idea-fn">sort</span>()`,
        `    metrics.<span class="idea-fn">inc</span>(<span class="idea-str">"reply"</span>)`
      ]
    }
  };

  function langStyle(product = getProduct()) {
    return product.comment;
  }

  function getProductId() {
    try {
      const value = localStorage.getItem(PRODUCT_KEY);
      if (value && PRODUCTS[value]) return value;
    } catch {
      /* ignore */
    }
    return DEFAULT_PRODUCT_ID;
  }

  function getProduct() {
    return PRODUCTS[getProductId()] || PRODUCTS[DEFAULT_PRODUCT_ID];
  }

  function nextProductId(id = getProductId()) {
    const index = PRODUCT_ORDER.indexOf(id);
    return PRODUCT_ORDER[(index + 1) % PRODUCT_ORDER.length];
  }

  function exportedIdent(stem) {
    return goIdent(stem, { fallback: "Topic", exported: true });
  }

  function goIdent(text, { fallback = "Topic", exported = false } = {}) {
    let out = "";
    for (const ch of Array.from(String(text || ""))) {
      if (/^[\p{L}\p{Nd}_]$/u.test(ch)) out += ch;
      else if (out && !out.endsWith("_")) out += "_";
    }
    out = out.replace(/_+/g, "_").replace(/^_|_$/g, "");
    if (!out) return fallback;
    if (/^\p{Nd}/u.test(out)) return `${fallback}_${out}`;
    if (exported && /^[a-z]$/.test(out.charAt(0))) {
      return out.charAt(0).toUpperCase() + out.slice(1);
    }
    return out;
  }

  function goPostIdent(name, postNumber) {
    const who = goIdent(name, { fallback: "anon" });
    const num = goFloorNumber("", postNumber);
    return `${who}_${num}`;
  }

  function goFloorNumber(floor, postNumber) {
    const n = String(floor || postNumber || "").replace(/[^\p{Nd}]/gu, "");
    return n || "0";
  }

  function stripHtmlToText(htmlOrText) {
    return String(htmlOrText || "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .replace(/&quot;/gi, "\"")
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&");
  }

  function goStringLiteral(htmlOrText) {
    const plain = stripHtmlToText(htmlOrText);
    let escaped = "";
    for (const ch of plain) {
      if (ch === "\\") escaped += "\\\\";
      else if (ch === "\"") escaped += "\\\"";
      else if (ch === "\n") escaped += "\\n";
      else if (ch === "\r") escaped += "\\r";
      else if (ch === "\t") escaped += "\\t";
      else escaped += ch;
    }
    return `<span class="idea-str">"${escapeHtml(escaped)}"</span>`;
  }

  function goRawStringDisplayLines(text) {
    const parts = String(text ?? "").split("`");
    if (parts.length === 1) {
      const rows = parts[0].split("\n");
      return rows.map((row, i) => {
        const open = i === 0 ? `<span class="idea-str">\`` : `<span class="idea-str">`;
        const close = i === rows.length - 1 ? `\`</span>` : `</span>`;
        return `${open}${escapeHtml(row)}${close}`;
      });
    }
    const pieces = [];
    for (let i = 0; i < parts.length; i += 1) {
      if (parts[i] !== "") {
        const rows = parts[i].split("\n");
        pieces.push(
          rows
            .map((row, li) => {
              const open = li === 0 ? `<span class="idea-str">\`` : `<span class="idea-str">`;
              const close = li === rows.length - 1 ? `\`</span>` : `</span>`;
              return `${open}${escapeHtml(row)}${close}`;
            })
            .join("\n")
        );
      }
      if (i < parts.length - 1) pieces.push(`<span class="idea-str">"\`"</span>`);
    }
    return (pieces.join(" + ") || `<span class="idea-str">\`\`</span>`).split("\n");
  }

  function goBodyFieldLines(text) {
    const rawLines = goRawStringDisplayLines(text);
    if (rawLines.length === 1) return [`\tBody: ${rawLines[0]},`];
    const lines = [`\tBody: ${rawLines[0]}`];
    for (let i = 1; i < rawLines.length; i += 1) {
      lines.push(i === rawLines.length - 1 ? `${rawLines[i]},` : rawLines[i]);
    }
    return lines;
  }

  function cookedToGoBody(cooked) {
    if (!cooked) return "";
    const extras = [];
    for (const img of cooked.querySelectorAll?.("img") || []) {
      const src = getImageSrc(img);
      if (src) extras.push(`[image] ${src}`);
    }
    let text = "";
    if (typeof cooked.innerText === "string" && cooked.innerText) text = cooked.innerText;
    else text = cooked.textContent || "";
    text = String(text)
      .replace(/\u00a0/g, " ")
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .trim();
    if (extras.length) text = text ? `${text}\n\n${extras.join("\n")}` : extras.join("\n");
    return text;
  }

  function productNamesLabel() {
    return PRODUCT_ORDER.map((id) => PRODUCTS[id].name).join(" / ");
  }

  function setProductId(id) {
    if (!PRODUCTS[id]) return;
    try {
      localStorage.setItem(PRODUCT_KEY, id);
    } catch {
      /* ignore */
    }
  }

  function productSplashBg(product = getProduct()) {
    const svg = product.mark(`${product.id}-sp`, `width="128" height="128"`);
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }

  const DEFAULT_SPLASH_BG = productSplashBg(PRODUCTS[DEFAULT_PRODUCT_ID]);

  const RAW_CSS = String.raw`
    /* Splash */
    .idea-ide-theme #d-splash,
    html.idea-ide-theme:has(#d-splash) {
      background-color: #2B2B2B !important;
    }

    .idea-ide-theme #d-splash {
      --dot-color: #00D886 !important;
      --splash-bg: ${DEFAULT_SPLASH_BG} !important;
      background: #2B2B2B !important;
    }

    .idea-ide-theme #d-splash .preloader-image {
      background-image: none !important;
      background-color: transparent !important;
    }

    .idea-ide-theme #d-splash .splash-logo-container {
      width: min(160px, 42vw) !important;
      height: min(160px, 42vw) !important;
      background-image: var(--splash-bg) !important;
      background-size: contain !important;
      background-repeat: no-repeat !important;
      background-position: center !important;
      opacity: 1 !important;
      animation: none !important;
      position: relative;
    }

    .idea-ide-theme #d-splash .idea-splash-caption {
      margin-top: 0.35rem;
      color: #BBBBBB;
      font-size: clamp(14px, 2.2vw, 18px);
      font-weight: 600;
      letter-spacing: 0.02em;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      text-align: center;
      user-select: none;
    }

    .idea-ide-theme #d-splash .dots {
      background-color: var(--dot-color) !important;
      filter: none !important;
    }

    .idea-ide-theme {

      color-scheme: light !important;
      --idea-status-text: "UTF-8  ·  tabs  ·  Go 1.26  ·  Darcula  ·  Linux DO";
      --idea-tab-icon: linear-gradient(135deg, #00D886, #007DFE);
      --idea-accent: #4A9FD8;
      --idea-accent-strong: #3592C4;
      --idea-accent-soft: #6CB2D9;
      --idea-bg: #FFFFFF;
      --idea-panel: #F2F2F2;
      --idea-panel-2: #E8E8E8;
      --idea-editor: #FFFFFF;
      --idea-fill-hover: #E5F3FF;
      --idea-row-hover: #E5F3FF;
      --idea-line: #C9C9C9;
      --idea-line-2: #D9D9D9;
      --idea-line-soft: #E5E5E5;
      --idea-line-strong: #A0A0A0;
      --idea-text: #000000;
      --idea-text-2: #444444;
      --idea-text-3: #777777;
      --idea-text-muted: #999999;
      --idea-selection: #A6D2FF;
      --idea-tab-active: #FFFFFF;
      --idea-tab-idle: #D9D9D9;
      --idea-scrollbar: #C1C1C1;
      --idea-shadow-1: rgb(0 0 0 / 8%);
      --idea-shadow-2: rgb(0 0 0 / 14%);
      --idea-shadow-3: rgb(0 0 0 / 22%);
      --idea-sidebar: 280px;
      --idea-tool-strip: 40px;
      --idea-menu: #F2F2F2;
      --idea-status: #F2F2F2;
      --primary: #000000 !important;
      --secondary: #FFFFFF !important;
      --tertiary: #4A9FD8 !important;
      --header_background: #F2F2F2 !important;
      --header_primary: #000000 !important;
      --highlight: #E5F3FF !important;
      --primary-low: #E8E8E8 !important;
      --primary-very-low: #F5F5F5 !important;
      --primary-low-mid: #C9C9C9 !important;
      --primary-medium: #777777 !important;
      --primary-high: #444444 !important;
      --primary-very-high: #000000 !important;
      --d-selected: #E5F3FF !important;
      --d-hover: #E5F3FF !important;
    }

    /* Darcula */
    .idea-ide-theme.idea-dark {
      color-scheme: dark !important;
      --idea-accent: #4A9FD8;
      --idea-accent-strong: #6CB2D9;
      --idea-accent-soft: #3D7A99;
      --idea-bg: #3C3F41;
      --idea-panel: #3C3F41;
      --idea-panel-2: #313335;
      --idea-editor: #2B2B2B;
      --idea-fill-hover: #4B6EAF;
      --idea-row-hover: #4B6EAF;
      --idea-line: #555555;
      --idea-line-2: #2C2E2F;
      --idea-line-soft: #323232;
      --idea-line-strong: #282828;
      --idea-text: #BBBBBB;
      --idea-text-2: #A9B7C6;
      --idea-text-3: #808080;
      --idea-text-muted: #606366;
      --idea-selection: #214283;
      --idea-tab-active: #4B6EAF;
      --idea-tab-idle: #3C3F41;
      --idea-scrollbar: #616161;
      --idea-shadow-1: rgb(0 0 0 / 25%);
      --idea-shadow-2: rgb(0 0 0 / 40%);
      --idea-shadow-3: rgb(0 0 0 / 55%);
      --idea-menu: #3C3F41;
      --idea-status: #3C3F41;
      --primary: #BBBBBB !important;
      --secondary: #2B2B2B !important;
      --tertiary: #4A9FD8 !important;
      --header_background: #3C3F41 !important;
      --header_primary: #BBBBBB !important;
      --highlight: #214283 !important;
      --primary-low: #313335 !important;
      --primary-very-low: #2B2B2B !important;
      --primary-low-mid: #555555 !important;
      --primary-medium: #808080 !important;
      --primary-high: #A9B7C6 !important;
      --primary-very-high: #BBBBBB !important;
      --d-selected: #4B6EAF !important;
      --d-hover: #2D6099 !important;
      --love: #C75450 !important;
    }

    .idea-ide-theme,
    .idea-ide-theme body {
      background: var(--idea-editor) !important;
      color: var(--idea-text) !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif !important;
    }

    /* Top bar */
    .idea-ide-theme .d-header-wrap {
      position: sticky !important;
      top: 0 !important;
      z-index: 1000 !important;
      background: var(--idea-menu) !important;
      border-bottom: 1px solid var(--idea-line-strong) !important;
      box-shadow: none !important;
    }

    .idea-ide-theme body .d-header {
      background: var(--idea-menu) !important;
      border-bottom: 1px solid var(--idea-line-2) !important;
      box-shadow: inset 0 1px 0 var(--idea-line) !important;
      height: 36px !important;
      min-height: 36px !important;
      /* Keep overflow visible so dropdown menus are not clipped. */
      overflow: visible !important;
    }

    .idea-ide-theme .d-header .wrap {
      max-width: none !important;
      padding: 0 8px !important;
      height: 36px !important;
      overflow: visible !important;
    }

    .idea-ide-theme .d-header .contents {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      height: 36px !important;
      overflow: visible !important;
    }

    .idea-ide-theme .d-header .home-logo-wrapper-outlet,
    .idea-ide-theme .d-header .title,
    .idea-ide-theme .d-header .title--minimized {
      display: flex !important;
      align-items: center !important;
      margin: 0 !important;
      min-width: 0 !important;
      flex: 0 0 auto !important;
    }

    .idea-ide-theme .d-header .title a {
      display: inline-flex !important;
      align-items: center !important;
      gap: 8px !important;
      color: var(--idea-text) !important;
      text-decoration: none !important;
    }

    /* Hide native site logo under the IDE brand. */
    .idea-ide-theme .d-header #site-logo,
    .idea-ide-theme .d-header .logo-big,
    .idea-ide-theme .d-header .logo-small,
    .idea-ide-theme .d-header .title img,
    .idea-ide-theme .d-header .title picture,
    .idea-ide-theme .d-header .title svg:not(.idea-brand svg) {
      display: none !important;
      visibility: hidden !important;
      width: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .idea-ide-theme .idea-brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--idea-text) !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      letter-spacing: 0.2px;
      white-space: nowrap;
      cursor: pointer;
      user-select: none;
      border-radius: 4px;
      padding: 2px 4px 2px 2px;
      margin: -2px -4px -2px -2px;
    }

    .idea-ide-theme .idea-brand:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .idea-ide-theme .idea-brand svg {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      border-radius: 3px;
    }

    /* IDE menu labels */
    .idea-ide-theme .idea-menubar {
      display: flex;
      align-items: center;
      gap: 1px;
      min-width: 0;
      overflow: hidden;
      flex: 1 1 auto;
    }

    .idea-ide-theme .idea-menubar button {
      height: 24px;
      padding: 0 8px;
      border: 0;
      border-radius: 2px;
      background: transparent;
      color: var(--idea-text-2);
      font-size: 12px;
      line-height: 24px;
      cursor: default;
      white-space: nowrap;
    }

    .idea-ide-theme .idea-menubar button:hover {
      background: var(--idea-fill-hover);
      color: var(--idea-text);
    }

    /* Topic chrome is replaced by editor tabs. */
    .idea-ide-topic .d-header .extra-info-wrapper,
    .idea-ide-topic .d-header .extra-info,
    .idea-ide-topic .d-header .header-title,
    .idea-ide-topic .d-header .categories-wrapper,
    .idea-ide-topic .d-header .topic-header-extra,
    .idea-ide-topic .d-header .two-rows {
      display: none !important;
    }

    /* Hide forum-heavy header actions; keep search/account. */
    .idea-ide-theme .d-header .language-switcher,
    .idea-ide-theme .d-header .chat-header-icon,
    .idea-ide-theme .d-header .header-buttons {
      display: none !important;
    }

    .idea-ide-theme .d-header-icons {
      display: flex !important;
      align-items: center !important;
      gap: 2px !important;
      margin-left: auto !important;
      flex: 0 0 auto !important;
    }

    .idea-ide-theme .d-header .panel {
      margin-left: auto !important;
      background: transparent !important;
      flex: 0 0 auto !important;
      overflow: visible !important;
    }

    /* Scope icon-button rules to the header only. */
    .idea-ide-theme .d-header-icons > li > :is(button.icon, button.btn, a.icon) {
      color: var(--idea-text-2) !important;
      border-radius: 2px !important;
      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      min-height: 28px !important;
      max-width: 28px !important;
      max-height: 28px !important;
      padding: 0 !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .idea-ide-theme .d-header-icons > li > :is(button.icon, button.btn, a.icon):hover {
      background: var(--idea-fill-hover) !important;
      color: var(--idea-text) !important;
    }

    .idea-ide-theme .d-header #current-user .avatar {
      width: 20px !important;
      height: 20px !important;
      border-radius: 2px !important;
    }

    /* Dropdown / floating menus */
    .idea-ide-theme :is(
      .menu-panel,
      .user-menu,
      .hamburger-panel,
      .search-menu,
      .fk-d-menu,
      .fk-d-menu__panel,
      .tippy-box,
      .dropdown-menu,
      .popup-menu
    ) {
      width: auto !important;
      min-width: 220px !important;
      max-width: min(420px, 92vw) !important;
      height: auto !important;
      max-height: min(70vh, 640px) !important;
      overflow: auto !important;
      padding: 6px 0 !important;
      border: 1px solid var(--idea-line) !important;
      border-radius: 4px !important;
      background: var(--idea-panel) !important;
      color: var(--idea-text) !important;
      box-shadow: 0 8px 24px var(--idea-shadow-3) !important;
      line-height: 1.4 !important;
      white-space: normal !important;
      z-index: 1200 !important;
    }

    .idea-ide-theme :is(
      .menu-panel,
      .user-menu,
      .hamburger-panel,
      .search-menu,
      .fk-d-menu,
      .fk-d-menu__panel,
      .tippy-box,
      .dropdown-menu,
      .popup-menu
    ) :is(button, a, li, .btn, .menu-item, .widget-link, .panel-link, span, div) {
      width: auto !important;
      max-width: none !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      white-space: normal !important;
      line-height: 1.4 !important;
    }

    .idea-ide-theme :is(
      .menu-panel,
      .user-menu,
      .hamburger-panel,
      .search-menu,
      .fk-d-menu__panel,
      .dropdown-menu
    ) :is(a, button, .btn, .widget-link, .panel-link) {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 8px 12px !important;
      color: var(--idea-text-2) !important;
      text-decoration: none !important;
      box-sizing: border-box !important;
    }

    .idea-ide-theme :is(
      .menu-panel,
      .user-menu,
      .hamburger-panel,
      .search-menu,
      .fk-d-menu__panel,
      .dropdown-menu
    ) :is(a, button, .btn, .widget-link, .panel-link):hover {
      background: var(--idea-fill-hover) !important;
      color: var(--idea-text) !important;
    }

    /* Notifications as Event Log */
    .idea-ide-theme :is(.user-menu, .menu-panel.user-menu) {
      min-width: 360px !important;
      max-width: min(480px, 94vw) !important;
      padding: 0 !important;
    }

    .idea-ide-theme .quick-access-panel,
    .idea-ide-theme #quick-access-all-notifications {
      margin: 0 !important;
      padding: 0 !important;
      background: var(--idea-editor) !important;
    }

    .idea-ide-theme .quick-access-panel > ul,
    .idea-ide-theme ul.user-menu-button-all-notifications,
    .idea-ide-theme ul[class*="user-menu-button-"] {
      list-style: none !important;
      margin: 0 !important;
      padding: 0 !important;
      max-height: min(56vh, 520px) !important;
      overflow: auto !important;
      background: var(--idea-editor) !important;
    }

    .idea-ide-theme .quick-access-panel li.notification,
    .idea-ide-theme ul[class*="user-menu-button-"] > li.notification {
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      border-bottom: 1px solid var(--idea-line-soft) !important;
      background: transparent !important;
    }

    .idea-ide-theme .quick-access-panel li.notification > a,
    .idea-ide-theme ul[class*="user-menu-button-"] > li.notification > a {
      display: grid !important;
      grid-template-columns: 28px minmax(0, 1fr) !important;
      align-items: start !important;
      gap: 8px !important;
      margin: 0 !important;
      padding: 8px 12px 8px 10px !important;
      border: 0 !important;
      border-left: 2px solid transparent !important;
      border-radius: 0 !important;
      background: transparent !important;
      color: var(--idea-text-2) !important;
      text-decoration: none !important;
      box-shadow: none !important;
    }

    .idea-ide-theme .quick-access-panel li.notification.unread > a,
    .idea-ide-theme ul[class*="user-menu-button-"] > li.notification.unread > a {
      border-left-color: var(--idea-accent) !important;
      background: color-mix(in srgb, var(--idea-accent) 8%, var(--idea-editor)) !important;
    }

    .idea-ide-theme .quick-access-panel li.notification > a:hover,
    .idea-ide-theme ul[class*="user-menu-button-"] > li.notification > a:hover {
      background: var(--idea-row-hover) !important;
      color: var(--idea-text) !important;
    }

    .idea-ide-theme .quick-access-panel .icon-avatar,
    .idea-ide-theme ul[class*="user-menu-button-"] .icon-avatar {
      position: relative !important;
      width: 24px !important;
      height: 24px !important;
      margin: 2px 0 0 !important;
      flex: none !important;
    }

    .idea-ide-theme .quick-access-panel .icon-avatar .avatar,
    .idea-ide-theme ul[class*="user-menu-button-"] .icon-avatar .avatar {
      width: 24px !important;
      height: 24px !important;
      border-radius: 2px !important;
      object-fit: cover !important;
    }

    .idea-ide-theme .quick-access-panel .icon-avatar__icon-wrapper,
    .idea-ide-theme ul[class*="user-menu-button-"] .icon-avatar__icon-wrapper {
      position: absolute !important;
      right: -3px !important;
      bottom: -3px !important;
      width: 12px !important;
      height: 12px !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 2px !important;
      background: var(--idea-panel) !important;
      box-shadow: 0 0 0 1px var(--idea-line) !important;
      color: var(--idea-accent) !important;
    }

    .idea-ide-theme .quick-access-panel .icon-avatar__icon-wrapper .d-icon,
    .idea-ide-theme ul[class*="user-menu-button-"] .icon-avatar__icon-wrapper .d-icon {
      width: 9px !important;
      height: 9px !important;
    }

    .idea-ide-theme .quick-access-panel li.notification > a > div:last-child,
    .idea-ide-theme ul[class*="user-menu-button-"] > li.notification > a > div:last-child {
      display: flex !important;
      flex-direction: column !important;
      gap: 2px !important;
      min-width: 0 !important;
    }

    .idea-ide-theme .quick-access-panel .item-label,
    .idea-ide-theme ul[class*="user-menu-button-"] .item-label {
      color: var(--idea-text) !important;
      font-size: 12px !important;
      font-weight: 600 !important;
      line-height: 1.3 !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
    }

    .idea-ide-theme .quick-access-panel .item-description,
    .idea-ide-theme ul[class*="user-menu-button-"] .item-description {
      color: var(--idea-text-3) !important;
      font-size: 12px !important;
      font-weight: 400 !important;
      line-height: 1.35 !important;
      display: -webkit-box !important;
      -webkit-line-clamp: 2 !important;
      -webkit-box-orient: vertical !important;
      overflow: hidden !important;
      white-space: normal !important;
    }

    .idea-ide-theme .quick-access-panel .panel-body-bottom {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: 6px !important;
      margin: 0 !important;
      padding: 6px 8px !important;
      border-top: 1px solid var(--idea-line) !important;
      background: var(--idea-panel) !important;
    }

    .idea-ide-theme .quick-access-panel .panel-body-bottom :is(a, button, .btn) {
      display: inline-flex !important;
      align-items: center !important;
      gap: 4px !important;
      height: 24px !important;
      min-height: 24px !important;
      padding: 0 8px !important;
      border: 1px solid var(--idea-line) !important;
      border-radius: 2px !important;
      background: var(--idea-panel-2) !important;
      color: var(--idea-text-2) !important;
      font-size: 12px !important;
      box-shadow: none !important;
    }

    .idea-ide-theme .quick-access-panel .panel-body-bottom :is(a, button, .btn):hover {
      background: var(--idea-fill-hover) !important;
      border-color: var(--idea-accent-soft) !important;
      color: var(--idea-text) !important;
    }

    .idea-ide-theme .quick-access-panel .panel-body-bottom .show-all {
      padding: 0 6px !important;
    }

    .idea-ide-theme :is(.d-header, .sidebar-wrapper) {
      color: var(--idea-text) !important;
    }

    /* Tool window strips (left / right) */
    .idea-ide-theme {
      --idea-strip-bg: #F2F2F2;
      --idea-strip-hover: #E5F3FF;
      --idea-strip-active: #A6D2FF;
      --idea-strip-text: #444444;
      --idea-strip-border: #C9C9C9;
      --idea-pv-bg: #F2F2F2;
      --idea-pv-path: #E8E8E8;
      --idea-pv-text: #000000;
      --idea-pv-muted: #6E6E6E;
      --idea-pv-hover: #E5F3FF;
      --idea-pv-selected: #A6D2FF;
      --idea-pv-border: #C9C9C9;
      --idea-pv-folder: #C3AA6C;
      --idea-pv-dot: #4A9EFF;
    }

    .idea-ide-theme.idea-dark {
      --idea-strip-bg: #2B2D30;
      --idea-strip-hover: #393B40;
      --idea-strip-active: #2D4A6F;
      --idea-strip-text: #BBBBBB;
      --idea-strip-border: #1E1F22;
      --idea-pv-bg: #2B2D30;
      --idea-pv-path: #3C3F41;
      --idea-pv-text: #BCBEC4;
      --idea-pv-muted: #6E6E6E;
      --idea-pv-hover: #393B40;
      --idea-pv-selected: #2D4A6F;
      --idea-pv-border: #1E1F22;
      --idea-pv-folder: #E8B86D;
      --idea-pv-dot: #4A9EFF;
    }

    .idea-ide-theme .idea-tool-strip {
      position: fixed;
      top: 36px;
      bottom: 22px;
      z-index: 950;
      width: var(--idea-tool-strip);
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 1px;
      padding: 4px 0;
      background: var(--idea-strip-bg);
      border-color: var(--idea-strip-border);
      color: var(--idea-strip-text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      user-select: none;
      overflow: hidden;
    }

    .idea-ide-theme .idea-tool-strip-left {
      left: 0;
      border-right: 1px solid var(--idea-strip-border);
    }

    .idea-ide-theme .idea-tool-strip-right {
      right: 0;
      border-left: 1px solid var(--idea-strip-border);
    }

    .idea-ide-theme .idea-tool-strip-spacer {
      flex: 1 1 auto;
      min-height: 8px;
      pointer-events: none;
    }

    .idea-ide-theme .idea-tool-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      width: 100%;
      min-height: 42px;
      margin: 0;
      padding: 4px 2px;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: inherit;
      cursor: default;
      appearance: none;
    }

    .idea-ide-theme .idea-tool-btn:hover {
      background: var(--idea-strip-hover);
    }

    .idea-ide-theme .idea-tool-btn.is-active {
      background: var(--idea-strip-active);
      color: var(--idea-pv-text);
    }

    .idea-ide-theme .idea-tool-btn-icon {
      width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
      line-height: 1;
      color: var(--idea-accent);
      flex: 0 0 auto;
    }

    .idea-ide-theme .idea-tool-btn-icon svg {
      width: 14px;
      height: 14px;
      display: block;
      fill: currentColor;
    }

    .idea-ide-theme .idea-tool-btn-label {
      display: block;
      max-width: 100%;
      padding: 0 1px;
      font-size: 9px;
      line-height: 1.15;
      text-align: center;
      word-break: break-all;
      overflow: hidden;
      max-height: 2.4em;
    }

    /* Flush sidebar to the left strip */
    .idea-ide-theme #main-outlet-wrapper {
      margin-left: 0 !important;
      margin-right: 0 !important;
      padding-left: var(--idea-tool-strip) !important;
      padding-right: var(--idea-tool-strip) !important;
      max-width: none !important;
      box-sizing: border-box !important;
    }

    .idea-ide-theme .sidebar-wrapper {
      margin-left: 0 !important;
      margin-right: 0 !important;
      left: var(--idea-tool-strip) !important;
    }

    .idea-ide-theme.has-sidebar-page #main-outlet-wrapper,
    .idea-ide-theme body.has-sidebar-page #main-outlet-wrapper {
      justify-content: flex-start !important;
    }

    /* Sidebar: Project View */

    .idea-ide-theme .sidebar__panel-switch-button,
    .idea-ide-theme .sidebar-footer-actions .sidebar__panel-switch-button,
    .idea-ide-theme button.sidebar__panel-switch-button[data-key="chat"] {
      display: none !important;
    }

    .idea-ide-theme .sidebar-wrapper,
    .idea-ide-theme .sidebar-container {
      background: var(--idea-pv-bg) !important;
      border-right: 1px solid var(--idea-pv-border) !important;
      color: var(--idea-pv-text) !important;
      font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, Monaco, monospace !important;
      font-size: 13px !important;
      line-height: 1.5 !important;
    }

    .idea-ide-theme .sidebar-container {
      display: flex !important;
      flex-direction: column !important;
      padding: 0 !important;
      gap: 0 !important;
    }

    /* Path bar */
    .idea-ide-theme .idea-project-title {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 0 0 auto;
      min-height: 28px;
      padding: 6px 12px;
      background: var(--idea-pv-path);
      color: var(--idea-pv-text);
      font-size: 12px;
      font-weight: 400;
      border-bottom: 1px solid var(--idea-pv-border);
      user-select: none;
    }

    .idea-ide-theme .idea-project-title-icon {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      color: var(--idea-pv-folder);
    }

    .idea-ide-theme .idea-project-title-icon svg {
      width: 16px;
      height: 16px;
      display: block;
      fill: currentColor;
    }

    .idea-ide-theme .idea-project-title-path {
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #A9B7C6;
    }

    .idea-ide-theme:not(.idea-dark) .idea-project-title-path {
      color: #444444;
    }

    .idea-ide-theme .idea-sidebar-search {
      display: none !important;
    }

    .idea-ide-theme .sidebar-sections,
    .idea-ide-theme .sidebar-container > .sidebar-section-wrapper,
    .idea-ide-theme .sidebar-wrapper .sidebar-sections {
      padding: 6px 0 10px !important;
      margin: 0 !important;
    }

    .idea-ide-theme .sidebar-section {
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
    }

    .idea-ide-theme .sidebar-section-header-wrapper,
    .idea-ide-theme .sidebar-section-link-wrapper {
      margin: 0 !important;
      padding: 0 !important;
    }

    .idea-ide-theme .sidebar-section-header,
    .idea-ide-theme .sidebar-section-header.btn,
    .idea-ide-theme .sidebar-section-header.btn-transparent {
      display: flex !important;
      align-items: center !important;
      justify-content: flex-start !important;
      gap: 4px !important;
      width: 100% !important;
      min-height: 22px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 2px 8px 2px 6px !important;
      border: 0 !important;
      border-radius: 3px !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--idea-pv-text) !important;
    }

    .idea-ide-theme .sidebar-section-header:hover {
      background: var(--idea-pv-hover) !important;
    }

    .idea-ide-theme .sidebar-section-header-caret {
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      width: 16px !important;
      min-width: 16px !important;
      height: 16px !important;
      margin: 0 !important;
      color: var(--idea-pv-muted) !important;
      font-size: 10px !important;
      line-height: 16px !important;
      transition: transform 0.15s;
    }

    /* Replace Discourse caret with ▼ */
    .idea-ide-theme .sidebar-section-header-caret .d-icon,
    .idea-ide-theme .sidebar-section-header-caret svg {
      display: none !important;
    }

    .idea-ide-theme .sidebar-section-header-caret::before {
      content: "▼";
      font-size: 10px;
      color: var(--idea-pv-muted);
      line-height: 1;
    }

    .idea-ide-theme .sidebar-section:not(.sidebar-section--expanded) .sidebar-section-header-caret {
      transform: rotate(-90deg);
      transform-origin: center;
    }

    .idea-ide-theme .idea-tree-dot {
      width: 6px;
      height: 6px;
      margin-right: 2px;
      border-radius: 50%;
      background: var(--idea-pv-dot);
      flex: 0 0 auto;
    }

    .idea-ide-theme .sidebar-section:not(.sidebar-section--expanded) .idea-tree-dot {
      display: none;
    }

    .idea-ide-theme .sidebar-section-header-text,
    .idea-ide-theme .sidebar-section-link {
      color: var(--idea-pv-text) !important;
      font-size: 13px !important;
      font-weight: 400 !important;
      line-height: 1.5 !important;
    }

    .idea-ide-theme .sidebar-section-header-text {
      display: inline-flex !important;
      align-items: center;
      gap: 4px;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--idea-pv-text) !important;
      font-weight: 400 !important;
    }

    .idea-ide-theme .sidebar-section-header-text:has(.idea-tree-label) {
      font-size: 0 !important;
      letter-spacing: 0 !important;
    }

    .idea-ide-theme .sidebar-section-header-text .idea-tree-label {
      font-size: 13px !important;
      font-weight: 400 !important;
      letter-spacing: 0 !important;
      color: var(--idea-pv-text) !important;
    }

    .idea-ide-theme .sidebar-section-header-text .idea-tree-dot {
      font-size: 13px !important;
    }

    .idea-ide-theme .sidebar-section-header-text .idea-node-icon {
      font-size: 13px !important;
      font-weight: 400 !important;
      letter-spacing: 0 !important;
    }

    .idea-ide-theme .sidebar-section-content {
      list-style: none !important;
      margin: 0 !important;
      padding: 0 0 0 18px !important;
    }

    .idea-ide-theme .sidebar-section-link.sidebar-row,
    .idea-ide-theme a.sidebar-section-link {
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      min-height: 22px !important;
      height: auto !important;
      margin: 0 !important;
      padding: 2px 8px 2px 6px !important;
      border: 0 !important;
      border-radius: 3px !important;
      box-shadow: none !important;
      background: transparent !important;
      color: var(--idea-pv-text) !important;
      text-decoration: none !important;
    }

    .idea-ide-theme .sidebar-section-link::before {
      content: "▼";
      width: 16px;
      min-width: 16px;
      height: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      visibility: hidden;
      font-size: 10px;
      color: var(--idea-pv-muted);
      flex: 0 0 auto;
    }

    .idea-ide-theme .sidebar-section-link:hover {
      background: var(--idea-pv-hover) !important;
      color: var(--idea-pv-text) !important;
    }

    .idea-ide-theme .sidebar-section-link.active,
    .idea-ide-theme .sidebar-section-link[aria-current="page"] {
      background: var(--idea-pv-selected) !important;
      color: var(--idea-pv-text) !important;
    }

    .idea-ide-theme .sidebar-section-link-content-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 13px !important;
      font-weight: 400 !important;
      color: inherit !important;
    }

    .idea-ide-theme .sidebar-section-link-prefix.icon > .d-icon,
    .idea-ide-theme .sidebar-section-link-prefix.icon > svg {
      display: none !important;
    }

    .idea-ide-theme .sidebar-section-link-prefix.icon {
      position: relative;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      width: 16px !important;
      min-width: 16px !important;
      height: 16px !important;
      margin: 0 !important;
      padding: 0 !important;
      color: inherit !important;
    }

    .idea-ide-theme .idea-node-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      vertical-align: middle;
      color: var(--idea-pv-folder);
    }

    .idea-ide-theme .idea-node-icon svg {
      width: 16px;
      height: 16px;
      display: block;
    }

    .idea-ide-theme .idea-node-icon.idea-icon-script svg,
    .idea-ide-theme .idea-node-icon.idea-icon-iml svg,
    .idea-ide-theme .idea-node-icon.idea-icon-yml svg,
    .idea-ide-theme .idea-node-icon.idea-icon-git svg {
      width: 14px;
      height: 14px;
    }

    .idea-ide-theme .idea-node-icon.idea-icon-folder { color: #E8B86D !important; }
    .idea-ide-theme .idea-node-icon.idea-icon-target { color: #CC7832 !important; }
    .idea-ide-theme .idea-node-icon.idea-icon-script { color: #A9B7C6 !important; }
    .idea-ide-theme .idea-node-icon.idea-icon-iml { color: #808080 !important; }
    .idea-ide-theme .idea-node-icon.idea-icon-yml { color: #CC7832 !important; }
    .idea-ide-theme .idea-node-icon.idea-icon-git { color: #808080 !important; }
    .idea-ide-theme .idea-node-icon.idea-icon-pom {
      color: #3D8BFD !important;
      font-weight: 700 !important;
      font-size: 14px !important;
      line-height: 16px !important;
      font-family: "JetBrains Mono", Menlo, Consolas, monospace !important;
    }

    .idea-ide-theme .sidebar-section-header-text .idea-node-icon {
      margin-left: 0;
      color: #E8B86D !important;
    }

    .idea-ide-theme .sidebar-section-link-prefix.image .prefix-image {
      width: 14px !important;
      height: 14px !important;
      border-radius: 2px !important;
      object-fit: cover;
    }

    .idea-ide-theme .sidebar-section-link-suffix.icon,
    .idea-ide-theme .sidebar-section-link-content-badge {
      color: var(--idea-pv-dot) !important;
      font-size: 10px !important;
      margin-left: auto !important;
    }

    .idea-ide-theme .sidebar-section-link-suffix.icon .d-icon,
    .idea-ide-theme .sidebar-section-link-content-badge .d-icon {
      width: 8px !important;
      height: 8px !important;
    }

    .idea-ide-theme .sidebar-footer-wrapper,
    .idea-ide-theme .sidebar-footer-actions {
      border-top: 1px solid var(--idea-pv-border) !important;
      background: var(--idea-pv-bg) !important;
      min-height: 28px !important;
      padding: 4px 4px 2px !important;
      margin-top: 4px !important;
    }

    .idea-ide-theme .sidebar-footer-actions .btn,
    .idea-ide-theme .sidebar-footer-actions button {
      min-height: 22px !important;
      height: 22px !important;
      border-radius: 3px !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--idea-pv-muted) !important;
    }

    /* Home: Git Log */
    .idea-ide-home #main-outlet-wrapper {
      background: var(--idea-editor) !important;
    }

    .idea-ide-home #main-outlet {
      max-width: none !important;
      padding: 0 0 48px !important;
      background: var(--idea-editor) !important;
    }

    .idea-ide-home .welcome-banner,
    .idea-ide-home .welcome-banner-wrapper,
    .idea-ide-home .welcome-banner__wrap,
    .idea-ide-home .custom-search-banner-wrap,
    .idea-ide-home .above-main-container-outlet,
    .idea-ide-home .above-main-container-outlet.welcome-link-banner-connector,
    .idea-ide-home .discourse-banner,
    .idea-ide-home .category-breadcrumb,
    .idea-ide-home .topic-create-button__combo,
    .idea-ide-home .d-combo-button,
    .idea-ide-home .topic-drafts-menu-trigger,
    .idea-ide-home .dismiss-container-top,
    .idea-ide-home #category-events-calendar,
    .idea-ide-home .topic-list-item .link-bottom-line,
    .idea-ide-home .topic-list-item .topic-statuses,
    .idea-ide-home .topic-list-item .topic-excerpt,
    .idea-ide-home .topic-list-item .topic-post-badges,
    .idea-ide-home .topic-list-item .badge-notification {
      display: none !important;
    }

    .idea-ide-home .idea-home-heading {
      display: flex;
      align-items: center;
      gap: 8px;
      height: 28px;
      margin: 0;
      padding: 6px 12px;
      border-bottom: 1px solid var(--idea-line-strong);
      background: var(--idea-panel);
      color: var(--idea-text);
      font-size: 12px;
      font-weight: 600;
    }

    .idea-ide-home .idea-home-heading::before {
      content: "";
      width: 14px;
      height: 14px;
      border-radius: 2px;
      background:
        linear-gradient(var(--idea-accent), var(--idea-accent)) center / 8px 2px no-repeat,
        linear-gradient(var(--idea-accent), var(--idea-accent)) center / 2px 8px no-repeat,
        var(--idea-panel-2);
      box-shadow: inset 0 0 0 1px var(--idea-line);
    }

    .idea-ide-home .list-controls {
      margin: 0 !important;
      padding: 0 !important;
      background: var(--idea-panel) !important;
      border-bottom: 1px solid var(--idea-line-2) !important;
    }

    .idea-ide-home .list-controls > .container {
      max-width: none !important;
      padding: 0 !important;
    }

    .idea-ide-home .navigation-container {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 12px !important;
      min-height: 32px !important;
      padding: 4px 12px !important;
      box-sizing: border-box !important;
    }

    .idea-ide-home .navigation-container .nav-pills {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 2px !important;
      margin: 0 !important;
      padding: 0 !important;
      list-style: none !important;
    }

    .idea-ide-home .nav-pills > li {
      margin: 0 !important;
    }

    .idea-ide-home .nav-pills > li > :is(a, button) {
      border: 0 !important;
      border-radius: 2px !important;
      background: transparent !important;
      color: var(--idea-text-2) !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      padding: 4px 10px !important;
      box-shadow: none !important;
    }

    .idea-ide-home .nav-pills > li > :is(a.active, button.active),
    .idea-ide-home .nav-pills > li.active > a {
      background: var(--idea-tab-active) !important;
      color: var(--idea-text) !important;
      box-shadow: inset 0 -2px 0 var(--idea-accent) !important;
    }

    .idea-ide-home .navigation-controls {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      margin: 0 !important;
    }

    .idea-ide-home .idea-create-topic {
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
      height: 24px !important;
      padding: 0 10px !important;
      border: 1px solid var(--idea-line) !important;
      border-radius: 2px !important;
      background: var(--idea-panel-2) !important;
      color: var(--idea-text) !important;
      font-size: 12px !important;
      line-height: 1 !important;
      text-decoration: none !important;
      cursor: pointer;
    }

    .idea-ide-home .idea-create-topic:hover {
      background: var(--idea-fill-hover) !important;
      border-color: var(--idea-accent-soft) !important;
    }

    .idea-ide-home .list-container,
    .idea-ide-home .list-container .row,
    .idea-ide-home #list-area,
    .idea-ide-home #list-area .contents {
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      background: var(--idea-editor) !important;
    }

    .idea-ide-home .show-more {
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: transparent !important;
    }

    .idea-ide-home .show-more > a {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      height: 28px !important;
      margin: 0 !important;
      border: 0 !important;
      border-bottom: 1px solid var(--idea-line-soft) !important;
      border-radius: 0 !important;
      background: color-mix(in srgb, var(--idea-accent) 16%, var(--idea-panel)) !important;
      color: var(--idea-text) !important;
      font-size: 12px !important;
      box-shadow: none !important;
    }

    .idea-ide-home .topic-list {
      width: 100% !important;
      margin: 0 !important;
      border-collapse: collapse !important;
      table-layout: fixed !important;
      background: var(--idea-editor) !important;
    }

    .idea-ide-home .topic-list-header {
      background: var(--idea-panel) !important;
    }

    .idea-ide-home .topic-list-header th {
      height: 28px !important;
      padding: 0 10px !important;
      border-bottom: 1px solid var(--idea-line) !important;
      color: var(--idea-text-3) !important;
      font-size: 0 !important;
      font-weight: 600 !important;
      text-align: left !important;
      vertical-align: middle !important;
      background: var(--idea-panel) !important;
    }

    .idea-ide-home .topic-list-header th > :not(.idea-column-label) {
      display: none !important;
    }

    .idea-ide-home .topic-list-header th .idea-column-label {
      display: inline !important;
      color: var(--idea-text-3) !important;
      font-size: 11px !important;
      text-transform: none !important;
      cursor: pointer;
    }

    .idea-ide-home .topic-list-header th.posters,
    .idea-ide-home .topic-list-item .posters {
      width: 120px !important;
    }

    .idea-ide-home .topic-list-header th.posts,
    .idea-ide-home .topic-list-header th.views,
    .idea-ide-home .topic-list-header th.activity,
    .idea-ide-home .topic-list-item .posts,
    .idea-ide-home .topic-list-item .views,
    .idea-ide-home .topic-list-item .activity {
      width: 88px !important;
      text-align: right !important;
    }

    .idea-ide-home .topic-list-item {
      height: 28px !important;
      background: var(--idea-editor) !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    .idea-ide-home .topic-list-item:hover,
    .idea-ide-home .topic-list-item.selected {
      background: var(--idea-row-hover) !important;
    }

    .idea-ide-home .topic-list-item > td {
      height: 28px !important;
      max-height: 28px !important;
      padding: 0 10px !important;
      border-bottom: 1px solid var(--idea-line-soft) !important;
      color: var(--idea-text-2) !important;
      vertical-align: middle !important;
      font-size: 12px !important;
      overflow: hidden !important;
    }

    /* Multi-lane git graph */
    .idea-ide-home .topic-list-item .main-link {
      position: relative;
      padding-left: 40px !important;
    }

    .idea-ide-home .topic-list-item .main-link > .idea-node-icon {
      display: none !important;
    }

    .idea-ide-home .topic-list-item .main-link::before,
    .idea-ide-home .topic-list-item .main-link::after {
      content: none !important;
      display: none !important;
    }

    .idea-ide-home .topic-list-item .idea-git-graph {
      position: absolute;
      left: 0;
      top: 0;
      width: 36px;
      height: 100%;
      margin: 0;
      pointer-events: none;
      overflow: visible;
    }

    .idea-ide-home .topic-list-item .idea-git-graph svg {
      display: block;
      width: 36px;
      height: 28px;
    }

    .idea-ide-home .topic-list-item .link-top-line {
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      min-width: 0 !important;
      overflow: hidden !important;
      white-space: nowrap !important;
    }

    .idea-ide-home .topic-list-item :is(.title, .title a, .link-top-line a.title, .raw-topic-link) {
      display: inline-block !important;
      max-width: 100% !important;
      overflow: hidden !important;
      color: var(--idea-text) !important;
      font-size: 13px !important;
      font-weight: 400 !important;
      line-height: 18px !important;
      text-decoration: none !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }

    .idea-ide-home .topic-list-item :is(.title:hover, .title a:hover, .link-top-line a.title:hover, .raw-topic-link:hover) {
      color: var(--idea-accent-strong) !important;
      text-decoration: none !important;
    }

    .idea-ide-home .topic-list-item .posters > :not(.idea-owner-name) {
      display: none !important;
    }

    .idea-ide-home .topic-list-item .posters .idea-owner-name {
      display: block;
      overflow: hidden;
      color: var(--idea-text-3) !important;
      font-size: 12px !important;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .idea-ide-home .topic-list-item :is(.posts, .views, .activity),
    .idea-ide-home .topic-list-item :is(.posts, .views, .activity) .number,
    .idea-ide-home .topic-list-item :is(.posts, .views, .activity) .relative-date {
      color: var(--idea-text-3) !important;
      font-size: 12px !important;
      font-variant-numeric: tabular-nums;
      font-weight: 400 !important;
      font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace !important;
    }

    .idea-ide-home .topic-list .num a,
    .idea-ide-home .topic-list .badge-posts {
      color: inherit !important;
      font-weight: 400 !important;
      background: transparent !important;
      box-shadow: none !important;
    }

    .idea-ide-home .topic-list-item :is(.heatmap-high, .heatmap-med, .heatmap-low, .coldmap-high, .coldmap-low) {
      color: var(--idea-text-2) !important;
    }

    .idea-ide-home .topic-list-bottom,
    .idea-ide-home .footer-message,
    .idea-ide-home .loading-container {
      background: var(--idea-editor) !important;
      color: var(--idea-text-3) !important;
      border: 0 !important;
    }

    /* Topic: code editor frame */
    .idea-ide-topic #main-outlet {
      max-width: none !important;
      padding: 0 0 72px !important;
      background: var(--idea-editor) !important;
    }

    .idea-ide-topic .idea-topic-context {
      display: flex;
      align-items: center;
      gap: 6px;
      min-height: 28px;
      padding: 4px 16px;
      border-bottom: 1px solid var(--idea-line-strong);
      background: var(--idea-panel);
      color: var(--idea-text-2);
      font-size: 12px;
      font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
    }

    .idea-ide-topic .idea-topic-context-sep {
      color: var(--idea-text-muted);
    }

    .idea-ide-topic .idea-editor-tabs {
      display: flex;
      align-items: flex-end;
      gap: 0;
      min-height: 32px;
      padding: 0 0 0 8px;
      border-bottom: 1px solid var(--idea-line-strong);
      background: var(--idea-panel-2);
      overflow-x: auto;
    }

    .idea-ide-topic .idea-editor-tab {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: 28px;
      padding: 0 14px;
      border: 1px solid transparent;
      border-bottom: 0;
      background: transparent;
      color: var(--idea-text-3);
      font-size: 12px;
      font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
      white-space: nowrap;
    }

    .idea-ide-topic .idea-editor-tab.active {
      background: var(--idea-editor);
      color: var(--idea-text);
      border-color: var(--idea-line-2);
      box-shadow: inset 0 2px 0 var(--idea-accent);
    }

    .idea-ide-topic .idea-editor-tab-icon {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      background: var(--idea-tab-icon, linear-gradient(135deg, #00D886, #007DFE));
      box-shadow: inset 0 0 0 1px rgb(0 0 0 / 25%);
      flex: 0 0 auto;
    }

    .idea-ide-topic #topic-title,
    .idea-ide-topic .topic-above-post-stream-outlet {
      display: none !important;
    }

    .idea-ide-topic .container.posts {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box !important;
      background: var(--idea-editor) !important;
    }

    .idea-ide-topic .container.posts > .row,
    .idea-ide-topic .topic-area,
    .idea-ide-topic .posts-wrapper,
    .idea-ide-topic .post-stream {
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .idea-ide-topic.idea-post-rows-themed .topic-post > article {
      display: block !important;
      border: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .idea-ide-topic.idea-post-rows-themed .topic-avatar,
    .idea-ide-topic.idea-post-rows-themed .post-avatar {
      display: none !important;
    }

    .idea-ide-topic.idea-post-rows-themed .topic-body,
    .idea-ide-topic.idea-post-rows-themed .post__body.topic-body {
      clear: both !important;
      float: none !important;
      width: 100% !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
      background: var(--idea-editor) !important;
      box-sizing: border-box !important;
    }

    /* Post meta is folded into the code header. */
    .idea-ide-topic.idea-post-rows-themed .topic-meta-data,
    .idea-ide-topic.idea-post-rows-themed .names,
    .idea-ide-topic.idea-post-rows-themed .post-infos,
    .idea-ide-topic.idea-post-rows-themed .post-info,
    .idea-ide-topic.idea-post-rows-themed .reply-to-tab,
    .idea-ide-topic.idea-post-rows-themed .read-state,
    .idea-ide-topic.idea-post-rows-themed .linuxfloor,
    .idea-ide-topic.idea-post-rows-themed .topic-map,
    .idea-ide-topic.idea-post-rows-themed .post-notice,
    .idea-ide-topic .more-topics__container,
    .idea-ide-topic .more-topics,
    .idea-ide-theme .global-notice,
    .idea-ide-theme #main-container > .global-notice {
      display: none !important;
    }

    .idea-ide-topic.idea-post-rows-themed .post-menu-area {
      display: none !important;
    }

    .idea-ide-topic.idea-post-rows-themed .topic-post:hover .post-menu-area {
      display: flex !important;
      position: sticky;
      bottom: 28px;
      z-index: 5;
      margin: 0 !important;
      padding: 6px 12px !important;
      border-top: 1px solid var(--idea-line-soft);
      background: color-mix(in srgb, var(--idea-panel) 92%, transparent);
      backdrop-filter: blur(4px);
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-frame {
      display: grid;
      grid-template-columns: 56px minmax(0, 1fr);
      width: 100%;
      min-height: 24px;
      background: var(--idea-editor);
      border-bottom: 1px solid var(--idea-line-soft);
      font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace !important;
    }

    .idea-ide-topic.idea-post-rows-themed
      .topic-post[data-post-number="1"]
      .idea-code-frame {
      border-bottom-width: 2px;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-gutter {
      grid-column: 1;
      padding: 10px 8px 18px 0;
      border-right: 1px solid var(--idea-line-soft);
      background: var(--idea-editor);
      color: #606366;
      font-size: 13px;
      line-height: 20px;
      text-align: right;
      user-select: none;
      white-space: pre;
      font-variant-numeric: tabular-nums;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-pane {
      grid-column: 2;
      min-width: 0;
      padding: 10px 18px 18px 14px;
      overflow-x: auto;
      overflow-y: visible;
    }

    .idea-ide-topic.idea-post-rows-themed .cooked.idea-cooked-hidden {
      display: none !important;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-lines {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-line {
      display: block;
      min-height: 20px;
      margin: 0;
      padding: 0;
      color: #A9B7C6;
      font-size: 13px;
      line-height: 20px;
      white-space: pre-wrap;
      word-break: break-word;
      tab-size: 4;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-line .idea-kw {
      color: #CC7832 !important;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-line .idea-str {
      color: #6A8759 !important;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-line .idea-fn {
      color: #FFC66D !important;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-line .idea-cmt {
      color: #808080 !important;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-line .idea-ann {
      color: #BBB529 !important;
    }

    .idea-ide-topic.idea-post-rows-themed .idea-code-line a {
      color: #6A8759 !important;
      text-decoration: underline !important;
      text-underline-offset: 2px;
    }

    /* Images collapsed until hover / focus / pin. */
    .idea-ide-topic.idea-post-rows-themed .idea-code-line.idea-code-image {
      cursor: pointer;
      overflow: visible !important;
    }

    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image
      > .idea-cmt::after {
      content: " · hover";
      opacity: 0.55;
    }

    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image:hover
      > .idea-cmt::after,
    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image:focus-within
      > .idea-cmt::after,
    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image.is-open
      > .idea-cmt::after,
    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image.is-pinned
      > .idea-cmt::after {
      content: "" !important;
    }

    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image
      .idea-code-image-preview {
      display: none !important;
      max-width: min(100%, 720px) !important;
      width: auto !important;
      height: auto !important;
      margin: 6px 0 4px 24px !important;
      border: 1px solid var(--idea-line-soft) !important;
      border-radius: 2px !important;
      visibility: hidden !important;
      opacity: 0 !important;
    }

    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image:hover
      .idea-code-image-preview,
    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image:focus-within
      .idea-code-image-preview,
    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image.is-open
      .idea-code-image-preview,
    .idea-ide-topic.idea-post-rows-themed
      .idea-code-line.idea-code-image.is-pinned
      .idea-code-image-preview {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .idea-ide-topic .topic-navigation {
      display: none !important;
    }

    .idea-ide-topic.idea-topic-tools-open .topic-navigation {
      position: fixed !important;
      z-index: 1080 !important;
      top: auto !important;
      right: calc(var(--idea-tool-strip) + 8px) !important;
      bottom: 78px !important;
      left: auto !important;
      display: block !important;
      width: 220px !important;
      margin: 0 !important;
      padding: 12px !important;
      border: 1px solid var(--idea-line) !important;
      border-radius: 4px !important;
      background: var(--idea-panel) !important;
      box-shadow: 0 8px 28px var(--idea-shadow-3) !important;
      box-sizing: border-box !important;
    }

    .idea-ide-topic.idea-topic-tools-open .timeline-container,
    .idea-ide-topic.idea-topic-tools-open .topic-timeline {
      position: static !important;
      display: block !important;
      width: 100% !important;
      transform: none !important;
    }

    .idea-ide-topic .idea-floating-toggle {
      position: fixed;
      z-index: 1081;
      bottom: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      padding: 0;
      border: 1px solid var(--idea-line) !important;
      border-radius: 3px !important;
      color: var(--idea-text-2) !important;
      background: var(--idea-panel) !important;
      box-shadow: 0 4px 16px var(--idea-shadow-2) !important;
      cursor: pointer;
    }

    .idea-ide-topic .idea-floating-toggle:hover,
    .idea-ide-topic .idea-floating-toggle:focus-visible,
    .idea-ide-topic.idea-topic-tools-open .idea-topic-tools-toggle {
      border-color: var(--idea-accent-soft) !important;
      color: var(--idea-accent-strong) !important;
      background: var(--idea-fill-hover) !important;
      outline: none;
    }

    .idea-ide-topic .idea-floating-toggle svg {
      width: 16px;
      height: 16px;
    }

    .idea-ide-topic .idea-topic-tools-toggle {
      right: calc(var(--idea-tool-strip) + 8px);
    }

    .idea-ide-topic .idea-back-toggle {
      right: calc(var(--idea-tool-strip) + 52px);
    }

    .idea-ide-topic .idea-post-style-toggle {
      left: calc(var(--idea-sidebar) + 24px);
    }

    body.idea-ide-topic:not(.has-sidebar-page) .idea-post-style-toggle {
      left: calc(var(--idea-tool-strip) + 8px);
    }

    /* Status bar */
    .idea-ide-theme #main-outlet::after {
      content: var(--idea-status-text, "UTF-8  ·  tabs  ·  Go 1.26  ·  Darcula  ·  Linux DO");
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 900;
      height: 22px;
      padding: 0 10px;
      border-top: 1px solid var(--idea-line-2);
      background: var(--idea-status);
      color: var(--idea-text-3);
      font-size: 11px;
      line-height: 22px;
      font-family: "JetBrains Mono", "SF Mono", Menlo, Consolas, monospace;
      pointer-events: none;
    }

    /* Narrow viewports: drop the tool strips and reclaim the gutters. */
    @media (max-width: 960px) {
      .idea-ide-theme .idea-tool-strip {
        display: none !important;
      }

      .idea-ide-theme #main-outlet-wrapper {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      .idea-ide-theme .sidebar-wrapper {
        left: 0 !important;
      }

      .idea-ide-topic.idea-topic-tools-open .topic-navigation {
        right: 24px !important;
      }

      .idea-ide-topic .idea-topic-tools-toggle {
        right: 24px;
      }

      .idea-ide-topic .idea-back-toggle {
        right: 68px;
      }

      body.idea-ide-topic:not(.has-sidebar-page) .idea-post-style-toggle {
        left: 24px;
      }
    }
  `;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    if (!document.documentElement) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = RAW_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

  function restyleSplash() {
    const splash = document.getElementById("d-splash");
    if (!splash) return;

    const product = getProduct();
    const splashBg = productSplashBg(product);

    splash.style.setProperty("--dot-color", product.accent, "important");
    splash.style.setProperty("--splash-bg", splashBg, "important");
    splash.style.setProperty("background", "#2B2B2B", "important");
    splash.style.setProperty("background-color", "#2B2B2B", "important");

    const logo = splash.querySelector(".splash-logo-container");
    if (!logo) return;

    logo.dataset.ideaSplash = "1";
    logo.dataset.product = product.id;
    logo.style.setProperty("background-image", splashBg, "important");

    let caption = splash.querySelector(".idea-splash-caption");
    if (!caption) {
      caption = document.createElement("div");
      caption.className = "idea-splash-caption";
      logo.insertAdjacentElement("afterend", caption);
    }
    caption.textContent = product.name;
  }

  function invalidateProductBoundUi() {
    const brand = document.querySelector(".idea-brand");
    if (brand) delete brand.dataset.product;
    const menubar = document.querySelector(".idea-menubar");
    if (menubar) delete menubar.dataset.product;
    for (const strip of document.querySelectorAll(".idea-tool-strip")) {
      delete strip.dataset.product;
    }
    document.querySelector(".idea-editor-tabs")?.removeAttribute("data-route-key");
    document.querySelector(".idea-topic-context")?.removeAttribute("data-route-key");
    for (const el of document.querySelectorAll(".idea-code-lines[data-signature]")) {
      delete el.dataset.signature;
    }
    for (const icon of document.querySelectorAll(".idea-node-icon")) {
      delete icon.dataset.svg;
    }
  }

  function onBrandClick(event) {
    event.preventDefault();
    event.stopPropagation();
    setProductId(nextProductId());
    invalidateProductBoundUi();
    applyTheme();
  }

  function makeBrand() {
    const titleLink = document.querySelector(".d-header .title a, .d-header .title--minimized a");
    if (!titleLink) return;

    for (const img of titleLink.querySelectorAll("img, picture, #site-logo")) {
      img.style.setProperty("display", "none", "important");
      img.setAttribute("hidden", "true");
    }

    const product = getProduct();
    let brand = titleLink.querySelector(".idea-brand");
    if (!brand) {
      brand = document.createElement("span");
      brand.className = "idea-brand";
      brand.title = `点击切换 ${productNamesLabel()}`;
      brand.addEventListener("click", onBrandClick);
      titleLink.appendChild(brand);
    }

    if (brand.dataset.product === product.id) return;

    brand.dataset.product = product.id;
    brand.setAttribute("aria-label", `${product.name}（点击切换产品外观）`);
    brand.innerHTML = `${product.mark(`${product.id}-lg`, `width="1em" height="1em"`)}<span>${product.name}</span>`;
  }

  function makeMenuBar() {
    const contents = document.querySelector(".d-header .contents");
    if (!contents) return;

    const product = getProduct();
    let bar = contents.querySelector(".idea-menubar");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "idea-menubar";
      bar.setAttribute("aria-hidden", "true");
      const panel = contents.querySelector(".panel");
      if (panel) contents.insertBefore(bar, panel);
      else contents.appendChild(bar);
    }

    if (bar.dataset.product === product.id) return;

    bar.dataset.product = product.id;
    bar.replaceChildren();
    for (const name of product.menus) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = name;
      button.tabIndex = -1;
      bar.appendChild(button);
    }
  }

  // Decorative tool-window strip icons (single-color, 16px viewBox).
  const STRIP_ICONS = {
    folder: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="${FOLDER_PATH}"/></svg>`,
    commit: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5v3.5M8 11v3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`,
    bookmark: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2.5h7v11l-3.5-2.8-3.5 2.8z" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`,
    structure: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 2.5h12v1.6H2zM4.5 6.5h9.5v1.6H4.5zM7 10.5h7v1.6H7z"/></svg>`,
    maven: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><text x="8" y="11.5" text-anchor="middle" font-size="9.5" font-weight="700" font-family="JetBrains Mono, Menlo, Consolas, monospace" fill="currentColor">M</text></svg>`,
    python: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><text x="8" y="11.5" text-anchor="middle" font-size="8" font-weight="700" font-family="JetBrains Mono, Menlo, Consolas, monospace" fill="currentColor">Py</text></svg>`,
    go: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><text x="8" y="11.5" text-anchor="middle" font-size="8" font-weight="700" font-family="JetBrains Mono, Menlo, Consolas, monospace" fill="currentColor">Go</text></svg>`,
    database: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><ellipse cx="8" cy="4" rx="5" ry="2" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3 4v8c0 1.1 2.24 2 5 2s5-.9 5-2V4" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M3 8c0 1.1 2.24 2 5 2s5-.9 5-2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`,
    ai: () =>
      `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5l1.5 4.5L14 7.5l-4.5 1.5L8 13.5 6.5 9 2 7.5 6.5 6z"/></svg>`
  };

  function buildToolStripButton(spec) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `idea-tool-btn${spec.active ? " is-active" : ""}`;
    button.tabIndex = -1;
    button.title = spec.label;

    const icon = document.createElement("span");
    icon.className = "idea-tool-btn-icon";
    icon.innerHTML = STRIP_ICONS[spec.icon]?.() || "";

    const label = document.createElement("span");
    label.className = "idea-tool-btn-label";
    label.textContent = spec.label;

    button.append(icon, label);
    return button;
  }

  function ensureToolStrip(side, buttons) {
    let strip = document.body.querySelector(`:scope > .idea-tool-strip-${side}`);
    if (!strip) {
      strip = document.createElement("div");
      strip.className = `idea-tool-strip idea-tool-strip-${side}`;
      strip.setAttribute("aria-hidden", "true");
      document.body.appendChild(strip);
    }

    const key = `${getProductId()}|${side}`;
    if (strip.dataset.product === key) return;
    strip.dataset.product = key;
    strip.replaceChildren();

    for (const spec of buttons || []) strip.appendChild(buildToolStripButton(spec));
  }

  function makeToolStrips() {
    if (!document.body) return;
    const product = getProduct();
    ensureToolStrip("left", product.stripLeft);
    ensureToolStrip("right", product.stripRight);
  }

  function makeFavicon() {
    const head = document.head;
    const logo = document.querySelector(".idea-brand svg");
    if (!head || !logo) return;

    const faviconSvg = logo.cloneNode(true);
    faviconSvg.setAttribute("width", "32");
    faviconSvg.setAttribute("height", "32");
    faviconSvg.removeAttribute("aria-hidden");
    const faviconHref = `data:image/svg+xml,${encodeURIComponent(
      new XMLSerializer().serializeToString(faviconSvg)
    )}`;

    let favicon = document.getElementById(FAVICON_ID);
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.id = FAVICON_ID;
      favicon.rel = "icon";
      head.appendChild(favicon);
    }

    for (const icon of head.querySelectorAll("link[rel~='icon']")) {
      if (icon.getAttribute("type") !== "image/svg+xml") {
        icon.setAttribute("type", "image/svg+xml");
      }
      if (icon.getAttribute("sizes") !== "any") icon.setAttribute("sizes", "any");
      if (icon.getAttribute("href") !== faviconHref) {
        icon.setAttribute("href", faviconHref);
      }
    }

    if (!faviconObserver) {
      faviconObserver = new MutationObserver(makeFavicon);
      faviconObserver.observe(head, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href", "rel", "type", "sizes"]
      });
    }
  }

  function isDarkMode() {
    const darkLink = document.querySelector("link.dark-scheme");
    if (!darkLink) return true; // 站点未声明时默认走 Darcula
    if (darkLink.media === "all") return true;
    if (darkLink.media === "none") return false;
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return true;
    }
  }

  function applyColorMode() {
    document.documentElement.classList.toggle(DARK_CLASS, isDarkMode());
  }

  function getSidebarRoot() {
    return document.querySelector(".sidebar-wrapper .sidebar-container, .sidebar-container");
  }

  function makeProjectTitleBar() {
    const sidebar = getSidebarRoot();
    if (!sidebar) return;

    let title = sidebar.querySelector(":scope > .idea-project-title");
    if (!title) {
      title = document.createElement("div");
      title.className = "idea-project-title";
      sidebar.prepend(title);
    }

    const folderSvg = IDEA_ICON.folder().html;
    const desired =
      `<span class="idea-project-title-icon" aria-hidden="true">${folderSvg}</span>` +
      `<span class="idea-project-title-path">linux.do&nbsp;&nbsp;~/linux.do</span>`;
    if (title.dataset.path !== "v4") {
      title.dataset.path = "v4";
      title.innerHTML = desired;
    }
  }

  function sectionTreeLabel(sectionName) {
    const aliases = getProduct().sidebarAliases || {};
    switch ((sectionName || "").toLowerCase()) {
      case "categories":
        return aliases.categories || "";
      case "tags":
        return aliases.tags || "";
      case "chat-channels":
      case "chat-search":
        return aliases.chat || "";
      case "chat-dms":
        return aliases.dms || "";
      default:
        if (sectionName === "资源" || /resource/i.test(sectionName)) {
          return aliases.resources || "";
        }
        return "";
    }
  }

  const FOLDER_PATH =
    "M1.5 2h5l1.5 1.5H14a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5H1.5a.5.5 0 0 1-.5-.5v-10A.5.5 0 0 1 1.5 2z";

  const IDEA_ICON = {
    folder: () => ({
      kind: "folder",
      html: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="${FOLDER_PATH}"/></svg>`
    }),
    target: () => ({
      kind: "target",
      html: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="${FOLDER_PATH}"/></svg>`
    }),
    script: () => ({
      kind: "script",
      html: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 3h12v1H2V3zm0 3h8v1H2V6zm0 3h10v1H2V9zm0 3h6v1H2v-1z"/></svg>`
    }),
    iml: () => ({
      kind: "iml",
      html: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3 2h8l2 2v10H3V2zm1 1v10h8V5H9V3H4z"/></svg>`
    }),
    yml: () => ({
      kind: "yml",
      html: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3 1h7l3 3v11H3V1zm1 1v12h8V5H9V2H4z"/></svg>`
    }),
    git: () => ({
      kind: "git",
      html: `<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 5l6 6M11 5l-6 6" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`
    }),
    pom: () => ({
      kind: "pom",
      html: `M`
    })
  };

  function pickSidebarIcon(link) {
    const li = link.closest("li");
    const section = link.closest(".sidebar-section");
    const sectionName = section?.getAttribute("data-section-name") || "";
    const linkName = (
      link.getAttribute("data-link-name") ||
      li?.getAttribute("data-list-item-name") ||
      ""
    ).toLowerCase();

    if (li?.hasAttribute("data-category-id") || sectionName === "categories") {
      if (linkName === "all-categories") return IDEA_ICON.pom();
      return IDEA_ICON.folder();
    }
    if (li?.hasAttribute("data-tag-name") || sectionName === "tags") {
      if (linkName === "all-tags") return IDEA_ICON.pom();
      return IDEA_ICON.target();
    }
    if (sectionName === "chat-channels" || sectionName === "chat-search") {
      return IDEA_ICON.script();
    }
    if (sectionName === "chat-dms") {
      return IDEA_ICON.iml();
    }
    if (sectionName === "资源" || /resource/i.test(sectionName)) {
      return IDEA_ICON.folder();
    }

    switch (linkName) {
      case "everything":
        return IDEA_ICON.folder();
      case "my-posts":
        return IDEA_ICON.script();
      case "my-messages":
        return IDEA_ICON.yml();
      case "ai-bot":
        return IDEA_ICON.script();
      case "upcoming-events":
        return IDEA_ICON.iml();
      case "connect":
      case "channel":
      case "idc flare":
        return IDEA_ICON.yml();
      case "more...":
        return IDEA_ICON.git();
      default:
        if (link.classList.contains("sidebar-more-section-trigger")) {
          return IDEA_ICON.git();
        }
        return IDEA_ICON.script();
    }
  }

  function ensureIdeaIcon(host, iconSpec) {
    if (!host || !iconSpec) return;
    const { kind, html } = iconSpec;
    let icon = host.querySelector(":scope > .idea-node-icon");
    if (!icon) {
      icon = document.createElement("span");
      icon.setAttribute("aria-hidden", "true");
      host.insertBefore(icon, host.firstChild);
    }
    const nextClass = `idea-node-icon idea-icon-${kind}`;
    if (icon.className !== nextClass) icon.className = nextClass;
    if (icon.dataset.kind !== kind || icon.dataset.svg !== html) {
      icon.dataset.kind = kind;
      icon.dataset.svg = html;
      icon.innerHTML = html;
    }
  }

  function syncSidebarIcons() {
    makeProjectTitleBar();

    for (const headerText of document.querySelectorAll(".sidebar-section-header-text")) {
      const section = headerText.closest(".sidebar-section");
      ensureIdeaIcon(headerText, IDEA_ICON.folder());

      let dot = headerText.querySelector(":scope > .idea-tree-dot");
      if (!dot) {
        dot = document.createElement("span");
        dot.className = "idea-tree-dot";
        dot.setAttribute("aria-hidden", "true");
      }
      const icon = headerText.querySelector(":scope > .idea-node-icon");
      if (icon) {
        if (dot.nextElementSibling !== icon) headerText.insertBefore(dot, icon);
      } else if (!dot.parentNode) {
        headerText.insertBefore(dot, headerText.firstChild);
      }

      const sectionName = section?.getAttribute("data-section-name") || "";
      const alias = sectionTreeLabel(sectionName);
      let label = headerText.querySelector(":scope > .idea-tree-label");
      if (alias) {
        if (!label) {
          label = document.createElement("span");
          label.className = "idea-tree-label";
          headerText.appendChild(label);
        }
        if (label.textContent !== alias) label.textContent = alias;
      } else if (label) {
        label.remove();
      }
    }

    for (const link of document.querySelectorAll(".sidebar-section-link")) {
      const prefix = link.querySelector(".sidebar-section-link-prefix.icon");
      if (!prefix) continue; // keep avatar prefixes for DMs
      ensureIdeaIcon(prefix, pickSidebarIcon(link));
    }
  }

  function makeHomeHeading() {
    const outlet = document.querySelector("#main-outlet");
    if (!outlet) return;
    let heading = document.querySelector(".idea-home-heading");
    if (!heading) {
      heading = document.createElement("div");
      heading.className = "idea-home-heading";
      outlet.prepend(heading);
    }
    heading.textContent = "Log · linux.do";
  }

  function makeCreateTopicButton() {
    const controls = document.querySelector(
      ".navigation-container .navigation-controls, .list-controls .navigation-controls"
    );
    if (!controls) return;

    const native =
      document.querySelector("#create-topic") ||
      document.querySelector("button[href='#'] .d-icon-plus")?.closest("button") ||
      document.querySelector(".list-controls button.btn-default, .list-controls a.btn");

    let button = document.querySelector(".idea-create-topic");
    if (!button) {
      button = document.createElement(native?.tagName === "A" ? "a" : "button");
      button.className = "idea-create-topic";
      button.type = native?.tagName === "A" ? undefined : "button";
      button.addEventListener("click", (event) => {
        if (!native) return;
        event.preventDefault();
        native.click();
      });
      controls.prepend(button);
    }

    button.textContent = getProduct().newFileLabel;

    if (native && !native.dataset.ideaHidden) {
      native.dataset.ideaHidden = "1";
      native.style.display = "none";
    }
  }

  function makeTopicContext() {
    const outlet = document.querySelector("#main-outlet");
    if (!outlet) return;

    let bar = document.querySelector(".idea-topic-context");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "idea-topic-context";
      outlet.prepend(bar);
    }

    const product = getProduct();
    const title =
      document.querySelector("#topic-title .fancy-title")?.textContent?.trim() ||
      document.title.replace(/\s*-\s*Linux DO.*$/i, "").trim() ||
      "untitled";
    const stem = sanitizeFileStem(title);
    const leaf = product.breadcrumbFileLeaf ? `${stem}.${product.ext}` : title;
    const routeKey = `${product.id}|${location.pathname}|${leaf}`;
    if (bar.dataset.routeKey === routeKey) return;
    bar.dataset.routeKey = routeKey;
    bar.innerHTML = "";

    const crumbs = ["linux.do", product.contextRoot, leaf];
    crumbs.forEach((part, index) => {
      if (index > 0) {
        const sep = document.createElement("span");
        sep.className = "idea-topic-context-sep";
        sep.textContent = "›";
        bar.appendChild(sep);
      }
      const span = document.createElement("span");
      span.textContent = part;
      if (index === crumbs.length - 1) span.style.color = "var(--idea-text)";
      bar.appendChild(span);
    });
  }

  function sanitizeFileStem(title) {
    const cleaned = (title || "untitled")
      .replace(/[\\/:*?"<>|]/g, " ")
      .replace(/\s+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 48);
    return cleaned || "untitled";
  }

  function getTopicTitleText() {
    return (
      document.querySelector("#topic-title .fancy-title")?.textContent?.trim() ||
      document.title.replace(/\s*-\s*Linux DO.*$/i, "").trim() ||
      "untitled"
    );
  }

  function makeEditorTabs() {
    const outlet = document.querySelector("#main-outlet");
    if (!outlet) return;

    let tabs = document.querySelector(".idea-editor-tabs");
    if (!tabs) {
      tabs = document.createElement("div");
      tabs.className = "idea-editor-tabs";
      const context = document.querySelector(".idea-topic-context");
      if (context?.nextSibling) outlet.insertBefore(tabs, context.nextSibling);
      else if (context) context.after(tabs);
      else outlet.prepend(tabs);
    }

    const product = getProduct();
    const title = getTopicTitleText();
    const fileName = `${sanitizeFileStem(title)}.${product.ext}`;
    const key = `${product.id}|${location.pathname}|${fileName}`;
    if (tabs.dataset.routeKey === key) return;
    tabs.dataset.routeKey = key;
    tabs.innerHTML = "";

    const tab = document.createElement("div");
    tab.className = "idea-editor-tab active";
    tab.innerHTML = `<span class="idea-editor-tab-icon" aria-hidden="true"></span><span>${fileName}</span>`;
    tabs.appendChild(tab);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wrapPlainText(text, width = 72) {
    const input = String(text || "").replace(/\s+/g, " ").trim();
    if (!input) return [""];
    const chars = Array.from(input);
    const rows = [];
    for (let i = 0; i < chars.length; i += width) {
      rows.push(chars.slice(i, i + width).join(""));
    }
    return rows.length ? rows : [""];
  }

  function serializeInline(node) {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.nodeValue || "");
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName.toLowerCase();
    if (tag === "br") return "\n";
    if (tag === "a") {
      const href = node.getAttribute("href") || "#";
      const label = escapeHtml((node.textContent || href).trim() || href);
      return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    }
    if (tag === "code") {
      return `<span class="idea-str">${escapeHtml(node.textContent || "")}</span>`;
    }
    if (tag === "strong" || tag === "b") {
      return `<span class="idea-ann">${escapeHtml(node.textContent || "")}</span>`;
    }
    if (tag === "em" || tag === "i") {
      return `<span class="idea-fn">${escapeHtml(node.textContent || "")}</span>`;
    }

    let html = "";
    for (const child of node.childNodes) html += serializeInline(child);
    return html;
  }

  function pushCommentLines(bucket, text, prefix = "// ") {
    const normalized = String(text || "").replace(/\r/g, "");
    const chunks = normalized.split("\n");
    for (const chunk of chunks) {
      const pieces = wrapPlainText(chunk, 72);
      for (const piece of pieces) {
        if (!piece) bucket.push(`<span class="idea-cmt">${prefix.trimEnd()}</span>`);
        else bucket.push(`<span class="idea-cmt">${prefix}${escapeHtml(piece)}</span>`);
      }
    }
  }

  function getImageSrc(img) {
    if (!img || img.nodeType !== Node.ELEMENT_NODE) return "";
    const lightbox = img.closest?.("a.lightbox, a[href]");
    const candidates = [
      img.getAttribute("data-orig-src"),
      img.getAttribute("data-large-src"),
      img.getAttribute("data-src"),
      img.currentSrc,
      img.getAttribute("src"),
      lightbox?.getAttribute("href")
    ];
    for (const value of candidates) {
      const src = String(value || "").trim();
      if (!src || src.startsWith("data:image/svg") || src === "#") continue;
      return src;
    }
    return "";
  }

  function buildImageCodeLine(prefix, src) {
    const safeSrc = escapeHtml(src || "");
    // Use data-src until reveal so display:none + lazy does not block loading.
    return (
      `<span class="idea-cmt">${prefix}[image]</span> ` +
      `<span class="idea-str">"${safeSrc}"</span>` +
      `<img class="idea-code-image-preview" data-src="${safeSrc}" alt="">`
    );
  }

  function pushImageNodes(bucket, root, prefix) {
    const images =
      root.tagName?.toLowerCase() === "img"
        ? [root]
        : Array.from(root.querySelectorAll?.("img") || []);
    let count = 0;
    for (const img of images) {
      const src = getImageSrc(img);
      if (!src) continue;
      bucket.push(buildImageCodeLine(prefix, src));
      count += 1;
    }
    return count;
  }

  function isImageContainer(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
    const tag = node.tagName.toLowerCase();
    if (tag === "img" || tag === "figure" || tag === "picture") return true;
    if (node.classList?.contains("lightbox-wrapper")) return true;
    if ((tag === "p" || tag === "div" || tag === "a") && node.querySelector?.("img")) return true;
    return false;
  }

  function createReplyPainter(product = getProduct()) {
    let seq = 0;
    const indent = product.indent;
    const comment = product.comment.replyComment;
    const str =
      product.quoteString || ((body) => `<span class="idea-str">"${body}"</span>`);
    const plainTemplates = product.replyPlain;
    const linkTemplate = product.replyLink;
    const listTemplate = product.replyList;
    const quoteTemplate = product.replyQuote;

    function paint(body, kind = "plain") {
      const text = body || "";
      if (kind === "link" || /<a\s/i.test(text)) return linkTemplate(indent, str, text);
      if (kind === "list") return listTemplate(indent, str, text.replace(/^(\d+\.\s+|- )/, ""));
      if (kind === "quote") return quoteTemplate(indent, comment, text);
      if (Array.from(text.replace(/<[^>]+>/g, "")).length <= 18) {
        return plainTemplates[2](indent, str, text); // short → assert
      }
      const tpl = plainTemplates[seq % plainTemplates.length];
      seq += 1;
      return tpl(indent, str, text);
    }

    return {
      pushText(bucket, textHtml, kind = "plain") {
        const inline = String(textHtml || "").replace(/\n+/g, "\n").trim();
        if (!inline) {
          bucket.push(paint("…", kind));
          return;
        }
        for (const part of inline.split("\n")) {
          if (!part.trim()) continue;
          bucket.push(paint(part, kind));
        }
      },
      blank() {
        return paint("…");
      }
    };
  }

  function collectCookedLineHtml(cooked, asReply) {
    const lines = [];
    const product = getProduct();
    const style = langStyle(product);
    const painter = asReply ? createReplyPainter(product) : null;
    const commentPrefix = asReply ? style.replyComment : style.bodyComment;

    const appendBlocks = (root) => {
      const children = Array.from(root.childNodes);
      if (!children.length) {
        if (asReply) painter.pushText(lines, escapeHtml(root.textContent || ""));
        else pushCommentLines(lines, root.textContent || "", commentPrefix);
        return;
      }

      for (const child of children) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = (child.nodeValue || "").replace(/ /g, " ");
          if (!text.trim()) continue;
          if (asReply) painter.pushText(lines, escapeHtml(text.trim()));
          else pushCommentLines(lines, text, commentPrefix);
          continue;
        }
        if (child.nodeType !== Node.ELEMENT_NODE) continue;

        const tag = child.tagName.toLowerCase();
        if (tag === "br") {
          if (!asReply) lines.push(`<span class="idea-cmt">${commentPrefix.trimEnd()}</span>`);
          continue;
        }

        if (isImageContainer(child)) {
          pushImageNodes(lines, child, commentPrefix);
          const clone = child.cloneNode(true);
          for (const img of clone.querySelectorAll?.("img") || []) img.remove();
          for (const a of clone.querySelectorAll?.("a.lightbox") || []) a.remove();
          const leftover = (clone.textContent || "").trim();
          if (leftover) {
            if (asReply) painter.pushText(lines, escapeHtml(leftover));
            else pushCommentLines(lines, leftover, commentPrefix);
          }
          continue;
        }

        if (tag === "p" || tag === "div" || /^h[1-6]$/.test(tag)) {
          const inline = serializeInline(child).replace(/\n+/g, "\n").trim();
          if (!inline) {
            if (!asReply) lines.push(`<span class="idea-cmt">${commentPrefix.trimEnd()}</span>`);
            continue;
          }
          if (asReply) painter.pushText(lines, inline);
          else {
            for (const part of inline.split("\n")) {
              if (!part.trim()) lines.push(`<span class="idea-cmt">${commentPrefix.trimEnd()}</span>`);
              else lines.push(`<span class="idea-cmt">${commentPrefix}</span>${part}`);
            }
          }
          continue;
        }
        if (tag === "ul" || tag === "ol") {
          const items = child.querySelectorAll(":scope > li");
          let index = 1;
          for (const item of items) {
            const bullet = tag === "ol" ? `${index}. ` : "- ";
            const inline = serializeInline(item).replace(/\n+/g, " ").trim();
            if (asReply) painter.pushText(lines, `${escapeHtml(bullet)}${inline}`, "list");
            else lines.push(`<span class="idea-cmt">${commentPrefix}${bullet}</span>${inline || ""}`);
            index += 1;
          }
          continue;
        }
        if (tag === "blockquote") {
          if (asReply) {
            const quoted = escapeHtml((child.textContent || "").replace(/\s+/g, " ").trim());
            if (quoted) painter.pushText(lines, quoted, "quote");
          } else {
            pushCommentLines(lines, child.textContent || "", style.quoteComment);
          }
          continue;
        }
        if (tag === "pre") {
          const codeText = child.textContent || "";
          if (asReply) {
            lines.push(
              `${product.indent}<span class="idea-cmt">${product.comment.line} snippet</span>`
            );
          } else {
            lines.push(`<span class="idea-cmt">${commentPrefix}----- code -----</span>`);
          }
          for (const row of codeText.replace(/\r/g, "").split("\n")) {
            lines.push(
              `${asReply ? product.indent : ""}` +
                `<span class="idea-str">${escapeHtml(row)}</span>`
            );
          }
          if (!asReply) {
            lines.push(`<span class="idea-cmt">${commentPrefix}----- end ------</span>`);
          }
          continue;
        }

        appendBlocks(child);
      }
    };

    appendBlocks(cooked);
    const emptyComment = `<span class="idea-cmt">${commentPrefix.trimEnd()}</span>`;
    while (lines.length && lines[lines.length - 1] === emptyComment) lines.pop();
    if (!lines.length) {
      return asReply ? [painter.blank()] : [emptyComment];
    }
    if (asReply) padShortReplyBody(lines, product);
    return lines;
  }

  function padShortReplyBody(lines, product = getProduct()) {
    const MIN_BODY = 5;
    const bodyCount = lines.filter((l) => String(l || "").trim()).length;
    if (bodyCount >= MIN_BODY) return;

    const fillers = product.replyFillers;
    if (!fillers || !fillers.length) return;

    const seed = bodyCount + lines.join("").length;
    let i = seed % fillers.length;
    lines.push(``);
    while (lines.filter((l) => String(l || "").trim()).length < MIN_BODY + 2) {
      lines.push(fillers[i % fillers.length]);
      i += 1;
      if (i > seed + fillers.length * 2) break;
    }
  }

  function getPostAuthorName(post) {
    return (
      post.querySelector(".topic-meta-data .full-name a, .names .full-name a")?.textContent?.trim() ||
      post.querySelector(".topic-meta-data .username a, .names .username a, .names a")?.textContent?.trim() ||
      post.querySelector(".full-name, .username")?.textContent?.trim() ||
      "unknown"
    );
  }

  function getPostTimeText(post) {
    return (
      post.querySelector(".topic-meta-data .relative-date, .post-infos .relative-date, .relative-date")
        ?.textContent?.trim() ||
      post.querySelector(".topic-meta-data time, .post-date")?.textContent?.trim() ||
      ""
    );
  }

  function getPostFloorLabel(post) {
    const floor =
      post.querySelector(".topic-meta-data .linuxfloor, .linuxfloor")?.textContent?.trim() ||
      (post.getAttribute("data-post-number") ? `#${post.getAttribute("data-post-number")}` : "");
    return floor;
  }

  function getReplyToName(post) {
    const tab = post.querySelector(".topic-meta-data .reply-to-tab, .reply-to-tab");
    if (!tab) return "";
    return tab.querySelector("span")?.textContent?.trim() || "";
  }

  function getReplyToLabel(post) {
    const name = getReplyToName(post);
    return name ? `reply-to ${name}` : "";
  }

  function buildHeaderLines(post) {
    const product = getProduct();
    const postNumber = post.getAttribute("data-post-number") || "?";
    const name = getPostAuthorName(post);
    const time = getPostTimeText(post);
    const floor = getPostFloorLabel(post);
    const replyToName = getReplyToName(post);
    const replyTo = replyToName ? `reply-to ${replyToName}` : "";
    const title = getTopicTitleText();
    const stem = sanitizeFileStem(title);

    if (postNumber === "1") {
      return product.headerTopic({ name, floor, time, stem, title, postNumber });
    }

    const methodName = `reply_${sanitizeFileStem(name) || "user"}_${postNumber}`.replace(
      /[^A-Za-z0-9_]/g,
      "_"
    );
    const meta = [
      floor || `#${postNumber}`,
      time ? `@ ${time}` : "",
      replyTo ? `| ${replyTo}` : ""
    ]
      .filter(Boolean)
      .join(" ");

    return product.headerReply({
      methodName,
      meta,
      name,
      floor,
      time,
      replyTo: replyToName,
      postNumber
    });
  }

  function buildFooterLines(post) {
    const product = getProduct();
    const postNumber = post.getAttribute("data-post-number") || "?";
    const ctx = {
      name: getPostAuthorName(post),
      time: getPostTimeText(post),
      floor: getPostFloorLabel(post),
      replyTo: getReplyToName(post),
      postNumber,
      body: product.paintBody === "raw-string" ? cookedToGoBody(post.querySelector(".cooked")) : ""
    };
    if (postNumber === "1") return product.footerTopic(ctx);
    return product.footerReply(ctx);
  }

  function renderGutter(gutter, lineCount) {
    const lines = Math.max(1, lineCount | 0);
    let text = "";
    for (let i = 1; i <= lines; i += 1) text += `${i}\n`;
    gutter.textContent = text;
  }

  function syncCodeFrames(enabled) {
    const posts = document.querySelectorAll(".topic-post");
    for (const post of posts) {
      const cooked = post.querySelector(".cooked");
      if (!cooked) continue;

      if (!enabled) {
        cooked.classList.remove("idea-cooked-hidden");
        const frame = post.querySelector(".idea-code-frame");
        frame?.remove();
        continue;
      }

      let frame = post.querySelector(".idea-code-frame");
      if (!frame) {
        frame = document.createElement("div");
        frame.className = "idea-code-frame";

        const gutter = document.createElement("div");
        gutter.className = "idea-gutter";
        gutter.setAttribute("aria-hidden", "true");

        const pane = document.createElement("div");
        pane.className = "idea-code-pane";

        const codeLines = document.createElement("div");
        codeLines.className = "idea-code-lines";

        pane.appendChild(codeLines);
        frame.appendChild(gutter);
        frame.appendChild(pane);
        cooked.parentNode.insertBefore(frame, cooked);
      }

      cooked.classList.add("idea-cooked-hidden");

      const gutter = frame.querySelector(".idea-gutter");
      const codeLines = frame.querySelector(".idea-code-lines");
      if (!gutter || !codeLines) continue;

      const isReply = (post.getAttribute("data-post-number") || "1") !== "1";
      const product = getProduct();
      const embedBody = product.paintBody === "raw-string";
      const paintReplyAsCode = isReply && !embedBody;
      const allLines = [
        ...buildHeaderLines(post),
        ...(embedBody ? [] : collectCookedLineHtml(cooked, paintReplyAsCode)),
        ...buildFooterLines(post)
      ];

      const signature = `v8:${getProductId()}\n${allLines.join("\n")}`;
      if (codeLines.dataset.signature !== signature) {
        codeLines.dataset.signature = signature;
        codeLines.innerHTML = allLines
          .map((html) => {
            const isImage = String(html).includes("idea-code-image-preview");
            const cls = isImage ? "idea-code-line idea-code-image" : "idea-code-line";
            const tabIndex = isImage ? ' tabindex="0"' : "";
            return `<div class="${cls}"${tabIndex}>${html || "&nbsp;"}</div>`;
          })
          .join("");
        bindCodeImageHover(codeLines);
      }

      const lineCount = codeLines.querySelectorAll(".idea-code-line").length || 1;
      if (gutter.dataset.lines !== String(lineCount)) {
        gutter.dataset.lines = String(lineCount);
        renderGutter(gutter, lineCount);
      }
    }
  }

  function revealCodeImage(line) {
    if (!line) return;
    line.classList.add("is-open");
    for (const img of line.querySelectorAll(".idea-code-image-preview")) {
      const src = img.getAttribute("data-src") || img.getAttribute("src") || "";
      if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);
    }
  }

  function bindCodeImageHover(root) {
    if (!root) return;
    for (const line of root.querySelectorAll(".idea-code-line.idea-code-image")) {
      if (line.dataset.imageBound === "1") continue;
      line.dataset.imageBound = "1";
      line.addEventListener("mouseenter", () => revealCodeImage(line));
      line.addEventListener("focus", () => revealCodeImage(line));
      line.addEventListener("mouseleave", () => line.classList.remove("is-open"));
      line.addEventListener("blur", () => line.classList.remove("is-open"));
      line.addEventListener("click", (event) => {
        // Click to pin / unpin.
        if (event.target?.closest?.("a, button")) return;
        event.preventDefault();
        if (line.classList.contains("is-pinned")) {
          line.classList.remove("is-pinned", "is-open");
        } else {
          line.classList.add("is-pinned");
          revealCodeImage(line);
        }
      });
    }
  }

  function makeColumnLabels() {
    const map = [
      [".topic-list-header th.topic-list-data.main-link, .topic-list-header th.default", "Subject"],
      [".topic-list-header th.posters", "Author"],
      [".topic-list-header th.posts", "Replies"],
      [".topic-list-header th.views", "Views"],
      [".topic-list-header th.activity", "Date"]
    ];

    for (const [selector, label] of map) {
      const th = document.querySelector(selector);
      if (!th) continue;
      let span = th.querySelector(".idea-column-label");
      if (!span) {
        span = document.createElement("span");
        span.className = "idea-column-label";
        th.appendChild(span);
      }
      span.textContent = label;
      if (!span.dataset.ideaSortBound) {
        span.dataset.ideaSortBound = "1";
        span.addEventListener("click", (event) => {
          const button = th.querySelector("button");
          if (!button) return;
          event.preventDefault();
          event.stopPropagation();
          button.click();
        });
      }
    }
  }

  function makeOwnerNames() {
    for (const posters of document.querySelectorAll(".topic-list-item .posters")) {
      if (posters.querySelector(".idea-owner-name")) continue;
      const anchor =
        posters.querySelector("a[data-user-card]") ||
        posters.querySelector("a") ||
        null;
      const name =
        anchor?.getAttribute("data-user-card") ||
        anchor?.getAttribute("title") ||
        anchor?.querySelector("img")?.getAttribute("alt") ||
        "";
      if (!name) continue;
      const span = document.createElement("span");
      span.className = "idea-owner-name";
      span.textContent = name;
      posters.appendChild(span);
    }
  }

  const GIT_GRAPH_COLORS = ["#4A9FD8", "#499C54", "#C1862E", "#954F72", "#39A7AC", "#D05A4E"];

  function gitLaneX(lane) {
    return 6 + lane * 9;
  }

  function gitColor(lane) {
    return GIT_GRAPH_COLORS[lane % GIT_GRAPH_COLORS.length];
  }

  function gitTopicSeed(row, index) {
    const id = row.getAttribute("data-topic-id") || "";
    let seed = index * 17 + 3;
    for (let i = 0; i < id.length; i++) seed = (seed * 33 + id.charCodeAt(i)) >>> 0;
    return seed;
  }

  function buildGitGraphSvg(plan) {
    const { actives, commitLane, action, fromLane, dotColor } = plan;
    const h = 28;
    const mid = h / 2;
    const parts = [];

    for (const lane of actives) {
      const x = gitLaneX(lane);
      const color = gitColor(lane);
      if (action === "cross" && (lane === fromLane || lane === commitLane)) {
        // Crossing lanes are drawn with curves below; skip stacked verticals.
        continue;
      }
      if (action === "merge" && lane === fromLane) {
        parts.push(
          `<path d="M${x} 0 V${mid - 1}" stroke="${color}" stroke-width="1.5" fill="none"/>`
        );
      } else if (action === "branch" && lane === commitLane) {
        parts.push(
          `<path d="M${x} ${mid + 1} V${h}" stroke="${color}" stroke-width="1.5" fill="none"/>`
        );
      } else {
        parts.push(
          `<path d="M${x} 0 V${h}" stroke="${color}" stroke-width="1.5" fill="none"/>`
        );
      }
    }

    if (action === "branch" && fromLane != null) {
      const x0 = gitLaneX(fromLane);
      const x1 = gitLaneX(commitLane);
      const color = gitColor(commitLane);
      parts.push(
        `<path d="M${x0} ${mid} C${x0} ${mid + 8}, ${x1} ${mid - 8}, ${x1} ${mid}" stroke="${color}" stroke-width="1.5" fill="none"/>`
      );
    }

    if (action === "merge" && fromLane != null) {
      const x0 = gitLaneX(fromLane);
      const x1 = gitLaneX(commitLane);
      const color = gitColor(fromLane);
      parts.push(
        `<path d="M${x0} ${mid} C${x0} ${mid + 8}, ${x1} ${mid - 8}, ${x1} ${mid}" stroke="${color}" stroke-width="1.5" fill="none"/>`
      );
    }

    if (action === "cross" && fromLane != null) {
      const x0 = gitLaneX(fromLane);
      const x1 = gitLaneX(commitLane);
      const color = gitColor(Math.max(fromLane, commitLane));
      parts.push(
        `<path d="M${x0} 0 C${x0} ${mid - 6}, ${x1} ${mid + 6}, ${x1} ${h}" stroke="${color}" stroke-width="1.5" fill="none"/>`
      );
      parts.push(
        `<path d="M${x1} 0 C${x1} ${mid - 6}, ${x0} ${mid + 6}, ${x0} ${h}" stroke="${gitColor(Math.min(fromLane, commitLane))}" stroke-width="1.5" fill="none"/>`
      );
    }

    const cx = gitLaneX(commitLane);
    parts.push(
      `<circle cx="${cx}" cy="${mid}" r="3.2" fill="${dotColor}" stroke="var(--idea-editor)" stroke-width="1.5"/>`
    );

    return `<svg viewBox="0 0 36 28" width="36" height="28" aria-hidden="true">${parts.join("")}</svg>`;
  }

  function allocGitLane(actives) {
    for (let lane = 0; lane < 4; lane++) {
      if (!actives.includes(lane)) return lane;
    }
    return -1;
  }

  function syncGitLogRows() {
    const rows = [...document.querySelectorAll(".topic-list-item")];
    const body = document.querySelector(".topic-list-body");
    // Lane allocator v3 — bump the cache prefix when changing this algorithm.
    const signature =
      "v3:" + rows.map((row) => row.getAttribute("data-topic-id") || "").join(",");
    if (body && body.dataset.ideaGitSig === signature) {
      if (rows.every((row) => row.querySelector(".main-link > .idea-git-graph"))) return;
    }
    if (body) body.dataset.ideaGitSig = signature;

    let actives = [0];
    let quiet = 0; // 连续「无分叉动作」计数，避免又缩成一条直线

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const main = row.querySelector(".main-link");
      if (!main) continue;
      main.querySelector(":scope > .idea-node-icon")?.remove();

      const seed = gitTopicSeed(row, index);
      const roll = seed % 12;
      let commitLane = actives[0];
      let action = "commit";
      let fromLane = null;
      const before = actives.slice();
      const freeLane = allocGitLane(actives);
      const forceBranch = quiet >= 3 || actives.length === 1;
      const pinned = row.classList.contains("pinned");

      if ((forceBranch || pinned || roll <= 3) && freeLane >= 0) {
        action = "branch";
        fromLane = actives[seed % actives.length];
        commitLane = freeLane;
        actives = [...actives, commitLane].sort((a, b) => a - b);
        quiet = 0;
      } else if (roll <= 6 && actives.length > 1) {
        // Merge side branches but keep at least one alternate when possible.
        const side = actives.filter((lane) => lane !== actives[0]);
        fromLane = side[seed % side.length];
        commitLane = actives[0];
        action = "merge";
        if (actives.length > 2 || roll % 2 === 0) {
          actives = actives.filter((lane) => lane !== fromLane);
        }
        // With two lanes, sometimes draw a merge without collapsing the lane.
        quiet = 0;
      } else if (roll <= 8 && actives.length > 1) {
        action = "cross";
        fromLane = actives[0];
        commitLane = actives[actives.length - 1];
        // After a cross, move the commit lane forward for visual priority.
        actives = [commitLane, ...actives.filter((lane) => lane !== commitLane)];
        quiet = 0;
      } else {
        commitLane = actives[seed % actives.length];
        quiet += 1;
        // Force a new branch after two idle single-lane steps.
        if (actives.length === 1) quiet = Math.max(quiet, 2);
      }

      let dotColor = gitColor(commitLane);
      if (pinned) dotColor = "#FE8157";
      else if (
        row.classList.contains("unseen-topic") ||
        row.classList.contains("unread-posts") ||
        row.querySelector(".badge-notification.unread-posts, .badge-notification.new-topic")
      ) {
        dotColor = "#4A9FD8";
      }

      const svg = buildGitGraphSvg({
        actives: action === "branch" ? before.concat(commitLane) : before,
        commitLane,
        action,
        fromLane,
        dotColor
      });

      let graph = main.querySelector(":scope > .idea-git-graph");
      if (!graph) {
        graph = document.createElement("span");
        graph.className = "idea-git-graph";
        graph.setAttribute("aria-hidden", "true");
        main.insertBefore(graph, main.firstChild);
      }
      if (graph.dataset.sig !== svg) {
        graph.dataset.sig = svg;
        graph.innerHTML = svg;
      }
    }
  }

  function getPostRowsMode() {
    try {
      const mode = localStorage.getItem(POST_ROWS_MODE_KEY);
      if (mode === "native" || mode === "ide") return mode;
    } catch {
      /* ignore */
    }
    return postRowsModeFallback;
  }

  function setPostRowsMode(mode) {
    postRowsModeFallback = mode;
    try {
      localStorage.setItem(POST_ROWS_MODE_KEY, mode);
    } catch {
      /* ignore */
    }
  }

  function makePostStyleToggle(postRowsThemed) {
    let button = document.querySelector(".idea-post-style-toggle");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "idea-floating-toggle idea-post-style-toggle";
      button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 6h16M4 12h10M4 18h14"/><path d="M16 10l4 4-4 4"/></svg>`;
      button.addEventListener("click", () => {
        const next = getPostRowsMode() === "native" ? "ide" : "native";
        setPostRowsMode(next);
        scheduleApply();
      });
      document.body.appendChild(button);
    }
    button.title = postRowsThemed ? "切换到接近原版排版" : "切换到 IDE 排版";
    button.setAttribute("aria-label", button.title);
  }

  function makeBackButton() {
    if (!document.body || document.querySelector(".idea-back-toggle")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "idea-floating-toggle idea-back-toggle";
    button.title = "返回上一页";
    button.setAttribute("aria-label", "返回上一页");
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 18l-6-6 6-6"/><path d="M9 12h11"/></svg>`;
    button.addEventListener("click", () => {
      if (history.length > 1) history.back();
      else location.href = "/";
    });
    document.body.appendChild(button);
  }

  function setTopicToolsOpen(button, isOpen) {
    if (!button) return;
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    document.documentElement.classList.toggle("idea-topic-tools-open", isOpen);
    document.body.classList.toggle("idea-topic-tools-open", isOpen);
  }

  function scheduleTopicToolsClose() {
    clearTimeout(topicToolsCloseTimer);
    topicToolsCloseTimer = setTimeout(() => {
      setTopicToolsOpen(document.querySelector(".idea-topic-tools-toggle"), false);
    }, 180);
  }

  function makeTopicToolsToggle() {
    if (!document.body) return;
    let button = document.querySelector(".idea-topic-tools-toggle");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "idea-floating-toggle idea-topic-tools-toggle";
      button.title = "显示时间线 / 工具";
      button.setAttribute("aria-label", "显示时间线 / 工具");
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>`;
      button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") !== "true";
        setTopicToolsOpen(button, open);
      });
      button.addEventListener("mouseenter", () => {
        clearTimeout(topicToolsCloseTimer);
        setTopicToolsOpen(button, true);
      });
      button.addEventListener("mouseleave", scheduleTopicToolsClose);
      document.body.appendChild(button);
    }

    if (!topicToolsOutsideBound) {
      topicToolsOutsideBound = true;
      document.addEventListener("mousemove", (event) => {
        const target = event.target;
        if (
          target?.closest?.(
            ".topic-navigation, .idea-topic-tools-toggle"
          )
        ) {
          clearTimeout(topicToolsCloseTimer);
          return;
        }
        if (document.documentElement.classList.contains("idea-topic-tools-open")) {
          scheduleTopicToolsClose();
        }
      });
    }
  }

  function syncProductClasses(root = document.documentElement) {
    const product = getProduct();
    root.dataset.ideaProduct = product.id;
    for (const id of Object.keys(PRODUCTS)) {
      root.classList.toggle(`idea-product-${id}`, id === product.id);
    }
    root.style.setProperty("--idea-status-text", JSON.stringify(product.statusText));
    root.style.setProperty("--idea-tab-icon", product.tabIcon);
    return product;
  }

  function applyTheme() {
    injectStyle();
    document.documentElement.classList.add("idea-ide-theme");
    syncProductClasses();
    applyColorMode();
    restyleSplash();
    if (!document.body) return;

    const isTopic = /^\/t\//.test(location.pathname);
    const postRowsThemed = !isTopic || getPostRowsMode() !== "native";

    document.documentElement.classList.toggle(HOME_CLASS, !isTopic);
    document.documentElement.classList.toggle(TOPIC_CLASS, isTopic);
    document.documentElement.classList.toggle(POST_ROWS_THEME_CLASS, postRowsThemed);
    document.body.classList.toggle(HOME_CLASS, !isTopic);
    document.body.classList.toggle(TOPIC_CLASS, isTopic);
    document.body.classList.toggle(POST_ROWS_THEME_CLASS, postRowsThemed);

    makeBrand();
    makeMenuBar();
    makeToolStrips();
    makeFavicon();
    syncSidebarIcons();

    const homeHeading = document.querySelector(".idea-home-heading");
    const topicContext = document.querySelector(".idea-topic-context");

    if (isTopic) {
      homeHeading?.remove();
      makeTopicContext();
      makeEditorTabs();
      syncCodeFrames(postRowsThemed);
      makeTopicToolsToggle();
      makeBackButton();
      makePostStyleToggle(postRowsThemed);
    } else {
      topicContext?.remove();
      document.querySelector(".idea-editor-tabs")?.remove();
      syncCodeFrames(false);
      for (const button of document.querySelectorAll(".idea-floating-toggle")) {
        button.remove();
      }
      document.documentElement.classList.remove("idea-topic-tools-open");
      document.body.classList.remove("idea-topic-tools-open");
      makeHomeHeading();
      makeCreateTopicButton();
      makeColumnLabels();
      makeOwnerNames();
      syncGitLogRows();
    }
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyTheme();
    });
  }

  function bootstrap() {
    if (!document.documentElement) {
      setTimeout(bootstrap, 0);
      return;
    }

    const initialIsTopic = /^\/t\//.test(location.pathname);
    document.documentElement.classList.toggle(
      POST_ROWS_THEME_CLASS,
      !initialIsTopic || getPostRowsMode() !== "native"
    );
    injectStyle();
    document.documentElement.classList.add("idea-ide-theme");
    syncProductClasses();
    applyColorMode();
    restyleSplash();

    try {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", () => applyColorMode());
    } catch {
      /* ignore */
    }

    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.documentElement, { childList: true, subtree: true });

    for (const method of ["pushState", "replaceState"]) {
      const original = history[method];
      history[method] = function (...args) {
        const result = original.apply(this, args);
        scheduleApply();
        return result;
      };
    }

    window.addEventListener("popstate", scheduleApply);
    window.addEventListener("hashchange", scheduleApply);
    document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
    document.addEventListener("turbo:load", scheduleApply);
    document.addEventListener("page:changed", scheduleApply);
    scheduleApply();
  }

  if (globalThis.__LINUXDO_IDEA_EXPORT__) {
    globalThis.__LINUXDO_IDEA__ = {
      PRODUCTS,
      PRODUCT_ORDER,
      DEFAULT_PRODUCT_ID,
      getProductId,
      getProduct,
      nextProductId,
      setProductId,
      langStyle,
      exportedIdent,
      goIdent,
      goPostIdent,
      goStringLiteral,
      goRawStringDisplayLines,
      goBodyFieldLines,
      cookedToGoBody,
      sectionTreeLabel,
      createReplyPainter,
      padShortReplyBody,
      buildHeaderLines,
      buildFooterLines
    };
  }

  bootstrap();
})();
