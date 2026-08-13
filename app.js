const STORAGE = {
  stats: "knovatrix-quiz-stats",
  history: "knovatrix-quiz-history-v2",
  wrong: "knovatrix-wrong-questions-v2",
  setup: "knovatrix-last-setup-v2",
  active: "knovatrix-active-session-v2"
};

const loadJson = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const savedSetup = loadJson(STORAGE.setup, {});
const state = {
  questions: [],
  setup: {
    level: savedSetup.level || "",
    subject: savedSetup.subject || "",
    decks: new Set(savedSetup.decks || []),
    types: new Set([savedSetup.types?.includes("short") ? "short" : "mcq"]),
    size: Number(savedSetup.size) || 10
  },
  catalog: { level: "all", subject: "all", type: "all", search: "" },
  session: [],
  sessionLabel: "",
  answers: {},
  flagged: new Set(),
  index: 0,
  resultSaved: false,
  stats: loadJson(STORAGE.stats, { answered: 0, correct: 0, sessions: 0 }),
  history: loadJson(STORAGE.history, []),
  wrongIds: new Set(loadJson(STORAGE.wrong, []))
};

const root = document.querySelector("#app");
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[char]));
function readMathGroup(input, start) {
  if (input[start] !== "{") return null;
  let depth = 0;
  for (let index = start; index < input.length; index += 1) {
    if (input[index] === "{") depth += 1;
    if (input[index] === "}") {
      depth -= 1;
      if (!depth) return { value: input.slice(start + 1, index), end: index + 1 };
    }
  }
  return null;
}

function renderMathFractions(input) {
  let output = "";
  let cursor = 0;
  while (cursor < input.length) {
    const marker = input.indexOf("\\frac{", cursor);
    if (marker < 0) return output + input.slice(cursor);
    const numerator = readMathGroup(input, marker + 5);
    const denominator = numerator ? readMathGroup(input, numerator.end) : null;
    if (!numerator || !denominator) {
      output += input.slice(cursor, marker + 5);
      cursor = marker + 5;
      continue;
    }
    output += input.slice(cursor, marker) + `<span class="fraction"><span>${renderMathFractions(numerator.value)}</span><span>${renderMathFractions(denominator.value)}</span></span>`;
    cursor = denominator.end;
  }
  return output;
}

function renderMathRoots(input) {
  let output = "";
  let cursor = 0;
  while (cursor < input.length) {
    const marker = input.indexOf("\\sqrt{", cursor);
    if (marker < 0) return output + input.slice(cursor);
    const group = readMathGroup(input, marker + 5);
    if (!group) {
      output += input.slice(cursor, marker + 5);
      cursor = marker + 5;
      continue;
    }
    output += input.slice(cursor, marker) + `√<span class="math-radicand">${renderMathFractions(group.value)}</span>`;
    cursor = group.end;
  }
  return output;
}

function renderMathOverlines(input) {
  let output = "";
  let cursor = 0;
  while (cursor < input.length) {
    const marker = input.indexOf("\\overline{", cursor);
    if (marker < 0) return output + input.slice(cursor);
    const group = readMathGroup(input, marker + 9);
    if (!group) {
      output += input.slice(cursor, marker + 9);
      cursor = marker + 9;
      continue;
    }
    output += input.slice(cursor, marker) + `<span class="overline">${renderMathFractions(group.value)}</span>`;
    cursor = group.end;
  }
  return output;
}
function formatMath(value) {
  const commands = {
    rightleftharpoons: "⇌", leftrightarrow: "↔", rightarrow: "→", leftarrow: "←", implies: "⇒",
    approx: "≈", propto: "∝", leq: "≤", geq: "≥", neq: "≠", times: " × ", div: " ÷ ",
    cdot: "·", pm: "±", mp: "∓", circ: "°", deg: "°", sim: "∼", infty: "∞", pi: "π",
    alpha: "α", beta: "β", gamma: "γ", delta: "δ", Delta: "Δ", Gamma: "Γ", theta: "θ",
    Theta: "Θ", lambda: "λ", mu: "μ", rho: "ρ", sigma: "σ", omega: "ω", phi: "φ", Phi: "Φ",
    eta: "η", kappa: "κ", tau: "τ", nu: "ν", xi: "ξ", zeta: "ζ", sum: "Σ", Sigma: "Σ", prod: "Π", int: "∫", oint: "∮", cap: "∩", cup: "∪", perp: "⊥", parallel: "∥", angle: "∠", triangle: "△", varepsilon: "ε", hbar: "ℏ", sin: "sin", cos: "cos", tan: "tan", log: "log", ln: "ln", lim: "lim", dots: "…", ldots: "…", to: "→", iff: "⇔", searrow: "↘", nearrow: "↗"
  };
  let output = esc(value).replace(/\$([^$]+)\$/g, "$1").replace(/\$/g, "");
  output = output.replace(/\\(?:text|mathrm|operatorname|mathcal|mathbb|mathbf|mathit)\{([^{}]*)\}/g, "$1");
  output = renderMathOverlines(renderMathRoots(renderMathFractions(output)));
  output = output.replace(/\\vec{([^{}]+)}/g, "$1⃗");
  output = output
    .replace(/\\xrightarrow{([^{}]+)}/g, '<span class="math-arrow">→<small>$1</small></span>')
    .replace(/\\xrightleftharpoons{([^{}]+)}/g, '<span class="math-arrow">⇌<small>$1</small></span>');
  output = output.replace(/\\(quad|qquad)/g, "　").replace(/\\[,;:!]/g, " ");
  output = output.replace(/\\(xrightleftharpoons|rightleftharpoons|leftrightarrow|xrightarrow|rightarrow|leftarrow|implies|iff|approx|propto|leq|geq|le|ge|neq|times|div|cdot|pm|mp|circ|deg|sim|infty|pi|alpha|beta|gamma|delta|Delta|Gamma|theta|Theta|lambda|mu|rho|sigma|omega|phi|Phi|eta|kappa|tau|nu|xi|zeta|sum|Sigma|prod|int|oint|cap|cup|perp|parallel|angle|triangle|varepsilon|hbar|sin|cos|tan|log|ln|lim|dots|ldots|to|searrow|nearrow)/g, (_, name) => commands[name] ?? (name === "le" ? "≤" : name === "ge" ? "≥" : name.startsWith("xrightarrow") ? "→" : name.startsWith("xright") ? "⇌" : ""));
  output = output.replace(/\\(?:left|right|begin|end)/g, "");
  output = output.replace(/\\%/g, "%").replace(/\\,/g, " ");
  output = output.replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>").replace(/\^([A-Za-z0-9+\-])/g, "<sup>$1</sup>");
  return output.replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>").replace(/_([A-Za-z0-9+\-])/g, "<sub>$1</sub>");
}
const normal = value => String(value ?? "").trim().replace(/\s+/g, "").toLowerCase();
const typeName = type => type === "short" ? "填充題" : "選擇題";
const normalizeQuestion = question => {
  const options = Array.isArray(question.options) ? question.options.filter(option => String(option ?? "").trim()) : [];
  return { ...question, options, type: options.length >= 4 ? "mcq" : "short" };
};
const routeName = () => location.hash.slice(1).split("?")[0] || "/";
const adSlot = placement => `<div class="ad-slot ad-slot-flow" data-ad-slot="${placement}" aria-label="贊助內容"></div>`;
const values = (key, list = state.questions) => [...new Set(list.map(item => item[key]))].sort((a, b) => String(a).localeCompare(String(b), "zh-Hant"));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function saveStats() {
  localStorage.setItem(STORAGE.stats, JSON.stringify(state.stats));
  localStorage.setItem(STORAGE.history, JSON.stringify(state.history));
  localStorage.setItem(STORAGE.wrong, JSON.stringify([...state.wrongIds]));
}

function saveSetup() {
  localStorage.setItem(STORAGE.setup, JSON.stringify({
    level: state.setup.level,
    subject: state.setup.subject,
    decks: [...state.setup.decks],
    types: [...state.setup.types],
    size: state.setup.size
  }));
}

function saveActiveSession() {
  if (!state.session.length) {
    sessionStorage.removeItem(STORAGE.active);
    return;
  }
  sessionStorage.setItem(STORAGE.active, JSON.stringify({
    ids: state.session.map(question => question.id),
    label: state.sessionLabel,
    answers: state.answers,
    flagged: [...state.flagged],
    index: state.index,
    resultSaved: state.resultSaved
  }));
}

function restoreActiveSession() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE.active));
    if (!saved?.ids?.length) return;
    state.session = saved.ids.map(id => state.questions.find(question => question.id === id)).filter(Boolean);
    state.sessionLabel = saved.label || "自訂練習";
    state.answers = saved.answers || {};
    state.flagged = new Set(saved.flagged || []);
    state.index = clamp(Number(saved.index) || 0, 0, Math.max(0, state.session.length - 1));
    state.resultSaved = Boolean(saved.resultSaved);
  } catch {}
}

function shuffle(list) {
  const output = [...list];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [output[index], output[target]] = [output[target], output[index]];
  }
  return output;
}

function answerIsCorrect(question, value) {
  if (question.type === "mcq") return Number(value) === Number(question.answer);
  const actual = normal(value);
  const expected = normal(question.answer);
  if (actual === expected) return true;
  if (!actual || !expected) return false;
  const actualNumber = Number(actual);
  const expectedNumber = Number(expected);
  return Number.isFinite(actualNumber) && Number.isFinite(expectedNumber) && actualNumber === expectedNumber;
}

function answerLabel(question, value) {
  if (value === null || value === undefined || value === "") return "未作答";
  if (question.type === "mcq") return question.options?.[Number(value)] ?? "未作答";
  return String(value);
}

function correctAnswerLabel(question) {
  return question.type === "mcq" ? question.options?.[Number(question.answer)] : question.answer;
}

function globalNav(active = "") {
  const items = [
    ["/", "任務中心"],
    ["/catalog", "題庫"],
    ["/wrong", `錯題本${state.wrongIds.size ? ` ${state.wrongIds.size}` : ""}`],
    ["/progress", "學習紀錄"]
  ];
  return `<nav class="workspace-nav" aria-label="刷題站主要功能">${items.map(([path, label]) =>
    `<a class="${active === path ? "active" : ""}" href="#${path}">${label}</a>`
  ).join("")}</nav>`;
}

function mount(html, focus = true) {
  root.innerHTML = html;
  window.KnovatrixAds?.mount();
  if (focus) root.focus({ preventScroll: true });
}

function pageHeading(eyebrow, title, description) {
  return `<header class="page-heading"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${description ? `<p>${description}</p>` : ""}</header>`;
}

const setupSteps = [
  ["/setup/level", "1", "學段"],
  ["/setup/subject", "2", "科目"],
  ["/setup/units", "3", "單元"],
  ["/setup/options", "4", "題型"],
  ["/setup/review", "5", "確認"]
];

function stepAvailable(path) {
  if (path === "/setup/level") return true;
  if (path === "/setup/subject") return Boolean(state.setup.level);
  if (path === "/setup/units") return Boolean(state.setup.level && state.setup.subject);
  if (path === "/setup/options") return Boolean(state.setup.decks.size);
  return Boolean(state.setup.level && state.setup.subject && state.setup.decks.size && state.setup.types.size);
}

function setupLayout(active, body, footer = "") {
  return `${globalNav()}<section class="setup-layout"><aside class="setup-steps" aria-label="建立任務步驟">${setupSteps.map(([path, number, label]) => {
    const enabled = stepAvailable(path);
    return enabled
      ? `<a class="${active === path ? "active" : ""}" href="#${path}"><span>${number}</span><b>${label}</b></a>`
      : `<span class="disabled"><i>${number}</i><b>${label}</b></span>`;
  }).join("")}</aside><div class="setup-stage">${body}${footer ? `<footer class="setup-actions">${footer}</footer>` : ""}</div></section>`;
}

function setupQuestions(includeDecks = true) {
  return state.questions.filter(question =>
    question.level === state.setup.level &&
    (!state.setup.subject || question.subject === state.setup.subject) &&
    (!includeDecks || !state.setup.decks.size || state.setup.decks.has(question.deck)) &&
    state.setup.types.has(question.type)
  );
}

function beginSession(questions, label) {
  if (!questions.length) return;
  state.session = shuffle(questions).slice(0, Math.min(state.setup.size, questions.length));
  state.sessionLabel = label;
  state.answers = {};
  state.flagged = new Set();
  state.index = 0;
  state.resultSaved = false;
  saveActiveSession();
  location.hash = "/quiz";
}

function renderDashboard() {
  const levels = values("level");
  const rate = state.stats.answered ? Math.round(state.stats.correct / state.stats.answered * 100) : 0;
  const recent = state.history.slice(0, 3);
  const learningPath = levels.length ? `<div class="level-launcher">${levels.map(level => {
    const questions = state.questions.filter(question => question.level === level);
    return `<button data-level="${esc(level)}"><b>${esc(level)}</b><span>${questions.length} 題 · ${values("deck", questions).length} 個單元</span></button>`;
  }).join("")}</div>` : `<div class="empty-state"><b>題庫準備中</b><span>目前尚未加入可作答題目；題目上架後會在這裡依學段開始。</span></div>`;
  mount(`${globalNav("/")}<section class="mission-hero"><div><p class="eyebrow">MISSION CENTER</p><h1>今天要完成哪一場練習？</h1><p>依學段、科目、單元與題型建立自己的練習任務。</p><div class="hero-actions"><button class="button" id="custom-mission">建立自訂任務</button></div></div><div class="today-panel"><span>累積正確率</span><b>${rate}%</b><small>${state.stats.correct} / ${state.stats.answered || 0} 題</small></div></section>
  ${adSlot("mobile-top")}${state.session.length && !state.resultSaved ? `<section class="resume-strip"><div><b>有一場尚未交卷的任務</b><span>${esc(state.sessionLabel)} · 已作答 ${Object.values(state.answers).filter(item => item.submitted).length} / ${state.session.length}</span></div><button class="button secondary" id="resume-mission">繼續作答</button></section>` : ""}
  <section class="dashboard-section"><div class="section-title"><div><p class="eyebrow">CHOOSE A MODE</p><h2>練習方式</h2></div></div><div class="mission-grid">
    <button class="mission-card primary" data-mode="custom"><span class="mission-index">01</span><b>自訂練習</b><p>逐步選擇學段、科目、單元與題型。</p><small>建立任務</small></button>
    <button class="mission-card ${state.wrongIds.size ? "" : "disabled"}" data-mode="wrong" ${state.wrongIds.size ? "" : "disabled"}><span class="mission-index">02</span><b>錯題重練</b><p>${state.wrongIds.size ? `目前有 ${state.wrongIds.size} 題待複習。` : "完成作答後，答錯的題目會自動收進這裡。"}</p><small>${state.wrongIds.size ? "開始複習" : "尚未有錯題"}</small></button>
  </div></section>
  <section class="dashboard-section split"><div><div class="section-title"><div><p class="eyebrow">LEARNING PATH</p><h2>依學段開始</h2></div></div>${learningPath}</div><aside class="record-summary"><p class="eyebrow">YOUR RECORD</p><h2>練習摘要</h2><dl><div><dt>完成任務</dt><dd>${state.stats.sessions}</dd></div><div><dt>累積作答</dt><dd>${state.stats.answered}</dd></div><div><dt>錯題待複習</dt><dd>${state.wrongIds.size}</dd></div></dl></aside></section>
  <section class="dashboard-section"><div class="section-title"><div><p class="eyebrow">RECENT MISSIONS</p><h2>最近任務</h2></div><a href="#/progress">查看完整紀錄</a></div>${recent.length ? `<div class="recent-missions">${recent.map(item => `<article><div><b>${esc(item.label)}</b><span>${new Date(item.date).toLocaleDateString("zh-TW")}</span></div><strong>${item.correct} / ${item.total}</strong></article>`).join("")}</div>` : `<div class="empty-state">完成第一場任務後，這裡會顯示最近的練習紀錄。</div>`}</section>`);
  root.querySelector("#custom-mission").onclick = () => location.hash = "/setup/level";
  root.querySelector("#resume-mission")?.addEventListener("click", () => location.hash = "/quiz");
  root.querySelectorAll("[data-mode]").forEach(button => button.onclick = () => {
    if (button.dataset.mode === "custom") location.hash = "/setup/level";
    if (button.dataset.mode === "wrong") location.hash = "/wrong";
  });
  root.querySelectorAll("[data-level]").forEach(button => button.onclick = () => {
    state.setup.level = button.dataset.level;
    state.setup.subject = "";
    state.setup.decks.clear();
    saveSetup();
    location.hash = "/setup/subject";
  });
}
function renderCatalog() {
  const filter = state.catalog;
  const levelItems = values("level");
  const levelQuestions = filter.level === "all" ? state.questions : state.questions.filter(question => question.level === filter.level);
  const subjectItems = values("subject", levelQuestions);
  if (filter.subject !== "all" && !subjectItems.includes(filter.subject)) filter.subject = "all";
  const filtered = state.questions.filter(question =>
    (filter.level === "all" || question.level === filter.level) &&
    (filter.subject === "all" || question.subject === filter.subject) &&
    (filter.type === "all" || question.type === filter.type) &&
    (!filter.search || `${question.deck} ${question.prompt}`.toLowerCase().includes(filter.search.toLowerCase()))
  );
  const groups = [];
  const map = new Map();
  filtered.forEach(question => {
    const key = `${question.level}|${question.subject}|${question.deck}`;
    if (!map.has(key)) {
      const group = { level: question.level, subject: question.subject, deck: question.deck, questions: [] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key).questions.push(question);
  });

  mount(`${globalNav("/catalog")}${pageHeading("QUESTION LIBRARY", "從單元開始選題", "只顯示已完成答案核對、能直接練習的題目。")}
  <section class="catalog-toolbar">
    <label><span>學段</span><select id="catalog-level"><option value="all">全部學段</option>${levelItems.map(item => `<option value="${esc(item)}" ${filter.level === item ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label>
    <label><span>科目</span><select id="catalog-subject"><option value="all">全部科目</option>${subjectItems.map(item => `<option value="${esc(item)}" ${filter.subject === item ? "selected" : ""}>${esc(item)}</option>`).join("")}</select></label>
    <label><span>題型</span><select id="catalog-type"><option value="all">全部題型</option><option value="mcq" ${filter.type === "mcq" ? "selected" : ""}>選擇題</option><option value="short" ${filter.type === "short" ? "selected" : ""}>填充題</option></select></label>
    <label class="catalog-search"><span>搜尋</span><input id="catalog-search" value="${esc(filter.search)}" placeholder="輸入單元或題目關鍵字"></label>
  </section>
  <div class="catalog-count"><b>${filtered.length}</b><span>題符合條件，分布於 ${groups.length} 個單元</span></div>
  ${adSlot("mobile-top")}
  <section class="unit-catalog">${groups.map(group => {
    const mcq = group.questions.filter(question => question.type === "mcq").length;
    const short = group.questions.length - mcq;
    return `<article class="unit-row"><div class="unit-color" aria-hidden="true"></div><div class="unit-copy"><span>${esc(group.level)} · ${esc(group.subject)}</span><h2>${esc(group.deck)}</h2><p>${group.questions.length} 題${mcq ? ` · 選擇 ${mcq}` : ""}${short ? ` · 填充 ${short}` : ""}</p></div><details><summary>查看題目</summary><ol>${group.questions.map(question => `<li>${formatMath(question.prompt)}</li>`).join("")}</ol></details><button class="button secondary" data-unit-start="${esc(group.level)}|${esc(group.subject)}|${esc(group.deck)}">用此單元出題</button></article>`;
  }).join("") || `<div class="empty-state">目前沒有符合篩選條件的題目。</div>`}</section>`);

  root.querySelector("#catalog-level").onchange = event => {
    filter.level = event.target.value;
    filter.subject = "all";
    renderCatalog();
  };
  root.querySelector("#catalog-subject").onchange = event => {
    filter.subject = event.target.value;
    renderCatalog();
  };
  root.querySelector("#catalog-type").onchange = event => {
    filter.type = event.target.value;
    renderCatalog();
  };
  root.querySelector("#catalog-search").oninput = event => {
    filter.search = event.target.value;
    renderCatalog();
  };
  root.querySelectorAll("[data-unit-start]").forEach(button => button.onclick = () => {
    const [level, subject, deck] = button.dataset.unitStart.split("|");
    state.setup.level = level;
    state.setup.subject = subject;
    state.setup.decks = new Set([deck]);
    state.setup.types = new Set(["mcq"]);
    saveSetup();
    location.hash = "/setup/options";
  });
}

function renderSetupLevel() {
  const levels = values("level");
  const body = `${pageHeading("STEP 1 OF 5", "選擇學段", "一次只建立一個學段的練習任務。")}<div class="single-select-panel"><label for="setup-level">學段</label><select id="setup-level"><option value="">請選擇學段</option>${levels.map(level => `<option value="${esc(level)}" ${state.setup.level === level ? "selected" : ""}>${esc(level)}</option>`).join("")}</select><div class="selection-preview" id="level-preview">${state.setup.level ? levelPreview(state.setup.level) : "選擇後會顯示目前可練習的題數與單元。"}</div></div>`;
  mount(setupLayout("/setup/level", body, `<a class="button secondary" href="#/">取消</a><button class="button" id="level-next" ${state.setup.level ? "" : "disabled"}>下一步：選科目</button>`));
  root.querySelector("#setup-level").onchange = event => {
    if (state.setup.level !== event.target.value) {
      state.setup.level = event.target.value;
      state.setup.subject = "";
      state.setup.decks.clear();
    }
    saveSetup();
    renderSetupLevel();
  };
  root.querySelector("#level-next").onclick = () => location.hash = "/setup/subject";
}

function levelPreview(level) {
  const questions = state.questions.filter(question => question.level === level);
  return `<b>${esc(level)}</b><span>${questions.length} 題 · ${values("subject", questions).length} 科 · ${values("deck", questions).length} 個單元</span>`;
}

function renderSetupSubject() {
  if (!state.setup.level) {
    location.hash = "/setup/level";
    return;
  }
  const questions = state.questions.filter(question => question.level === state.setup.level);
  const subjects = values("subject", questions);
  const body = `${pageHeading("STEP 2 OF 5", "選擇科目", `目前學段：${esc(state.setup.level)}`)}<div class="option-cards">${subjects.map(subject => {
    const subjectQuestions = questions.filter(question => question.subject === subject);
    return `<button class="${state.setup.subject === subject ? "selected" : ""}" data-subject="${esc(subject)}"><span class="option-mark" aria-hidden="true"></span><b>${esc(subject)}</b><p>${subjectQuestions.length} 題 · ${values("deck", subjectQuestions).length} 個單元</p></button>`;
  }).join("")}</div>`;
  mount(setupLayout("/setup/subject", body, `<a class="button secondary" href="#/setup/level">上一步</a><button class="button" id="subject-next" ${state.setup.subject ? "" : "disabled"}>下一步：選單元</button>`));
  root.querySelectorAll("[data-subject]").forEach(button => button.onclick = () => {
    if (state.setup.subject !== button.dataset.subject) {
      state.setup.subject = button.dataset.subject;
      state.setup.decks.clear();
    }
    saveSetup();
    renderSetupSubject();
  });
  root.querySelector("#subject-next").onclick = () => location.hash = "/setup/units";
}

function renderSetupUnits() {
  if (!state.setup.level || !state.setup.subject) {
    location.hash = state.setup.level ? "/setup/subject" : "/setup/level";
    return;
  }
  const questions = state.questions.filter(question => question.level === state.setup.level && question.subject === state.setup.subject);
  const decks = values("deck", questions);
  state.setup.decks = new Set([...state.setup.decks].filter(deck => decks.includes(deck)));
  const body = `${pageHeading("STEP 3 OF 5", "勾選練習單元", `${esc(state.setup.level)} · ${esc(state.setup.subject)}，可複選單元。`)}
  <div class="unit-tools"><span>已選 <b>${state.setup.decks.size}</b> / ${decks.length} 個單元</span><div><button class="text-button" id="select-all">全部選取</button><button class="text-button" id="clear-units">清除</button></div></div>
  <div class="unit-picker">${decks.map(deck => {
    const deckQuestions = questions.filter(question => question.deck === deck);
    return `<label class="${state.setup.decks.has(deck) ? "selected" : ""}"><input type="checkbox" value="${esc(deck)}" ${state.setup.decks.has(deck) ? "checked" : ""}><span><b>${esc(deck)}</b><small>${deckQuestions.length} 題 · ${deckQuestions.filter(question => question.type === "mcq").length} 選擇 · ${deckQuestions.filter(question => question.type === "short").length} 填充</small></span></label>`;
  }).join("")}</div>`;
  mount(setupLayout("/setup/units", body, `<a class="button secondary" href="#/setup/subject">上一步</a><button class="button" id="units-next" ${state.setup.decks.size ? "" : "disabled"}>下一步：題型與題數</button>`));
  root.querySelectorAll(".unit-picker input").forEach(input => input.onchange = () => {
    input.checked ? state.setup.decks.add(input.value) : state.setup.decks.delete(input.value);
    saveSetup();
    renderSetupUnits();
  });
  root.querySelector("#select-all").onclick = () => {
    state.setup.decks = new Set(decks);
    saveSetup();
    renderSetupUnits();
  };
  root.querySelector("#clear-units").onclick = () => {
    state.setup.decks.clear();
    saveSetup();
    renderSetupUnits();
  };
  root.querySelector("#units-next").onclick = () => location.hash = "/setup/options";
}

function renderSetupOptions() {
  if (!state.setup.decks.size) {
    location.hash = "/setup/units";
    return;
  }
  const allForUnits = state.questions.filter(question =>
    question.level === state.setup.level &&
    question.subject === state.setup.subject &&
    state.setup.decks.has(question.deck)
  );
  const eligible = allForUnits.filter(question => state.setup.types.has(question.type));
  state.setup.size = clamp(state.setup.size, 1, Math.max(1, eligible.length));
  const body = `${pageHeading("STEP 4 OF 5", "設定題型與題數", "依目前單元範圍調整這次任務。")}
  <section class="option-section"><h2>題型</h2><div class="segmented">${["mcq", "short"].map(type => {
    const count = allForUnits.filter(question => question.type === type).length;
    return `<button class="${state.setup.types.has(type) ? "active" : ""}" data-type="${type}" ${count ? "" : "disabled"}><b>${typeName(type)}</b><span>${count} 題</span></button>`;
  }).join("")}</div></section>
  <section class="option-section"><h2>題數</h2><div class="size-presets">${[5, 10, 15].map(size => `<button data-size="${size}" ${eligible.length < size ? "disabled" : ""}>${size} 題</button>`).join("")}<button data-size="all" ${eligible.length ? "" : "disabled"}>全部</button></div><label class="size-control"><span>自訂題數</span><input id="setup-size" type="number" min="1" max="${Math.max(1, eligible.length)}" value="${state.setup.size}" ${eligible.length ? "" : "disabled"}><small>依目前題型可選 ${eligible.length} 題</small></label></section>`;
  mount(setupLayout("/setup/options", body, `<a class="button secondary" href="#/setup/units">上一步</a><div class="setup-count"><b>${eligible.length}</b><span>題符合設定</span></div><button class="button" id="options-next" ${eligible.length ? "" : "disabled"}>下一步：確認任務</button>`));
  root.querySelectorAll("[data-type]").forEach(button => button.onclick = () => {
    const type = button.dataset.type;
    state.setup.types = new Set([type]);
    saveSetup();
    renderSetupOptions();
  });
  root.querySelectorAll("[data-size]").forEach(button => button.onclick = () => {
    state.setup.size = button.dataset.size === "all" ? eligible.length : Number(button.dataset.size);
    saveSetup();
    renderSetupOptions();
  });
  root.querySelector("#setup-size").onchange = event => {
    state.setup.size = clamp(Number(event.target.value) || 1, 1, Math.max(1, eligible.length));
    saveSetup();
    renderSetupOptions();
  };
  root.querySelector("#options-next").onclick = () => location.hash = "/setup/review";
}
function renderSetupReview() {
  if (!stepAvailable("/setup/review")) {
    location.hash = "/setup/level";
    return;
  }
  const eligible = setupQuestions();
  const count = Math.min(state.setup.size, eligible.length);
  const body = `${pageHeading("STEP 5 OF 5", "確認練習任務", "開始後仍可標記題目、跳題與查看題號狀態。")}
  <div class="mission-review"><dl><div><dt>學段</dt><dd>${esc(state.setup.level)}</dd></div><div><dt>科目</dt><dd>${esc(state.setup.subject)}</dd></div><div><dt>單元</dt><dd>${[...state.setup.decks].map(esc).join("、")}</dd></div><div><dt>題型</dt><dd>${[...state.setup.types].map(typeName).join("、")}</dd></div><div><dt>本次題數</dt><dd>${count} 題</dd></div></dl></div>`;
  mount(setupLayout("/setup/review", body, `<a class="button secondary" href="#/setup/options">上一步</a><button class="button" id="start-custom">開始作答</button>`));
  root.querySelector("#start-custom").onclick = () => {
    saveSetup();
    beginSession(eligible, `${state.setup.level}｜${state.setup.subject}｜${state.setup.decks.size} 單元`);
  };
}
function renderQuiz() {
  const question = state.session[state.index];
  if (!question) {
    location.hash = "/setup/level";
    return;
  }
  const answer = state.answers[question.id] || { value: null, submitted: false, correct: false };
  const answeredCount = Object.values(state.answers).filter(item => item.submitted).length;
  const correctCount = Object.values(state.answers).filter(item => item.submitted && item.correct).length;
  const progress = Math.round(answeredCount / state.session.length * 100);
  const answerHtml = question.type === "short"
    ? `<input class="short-answer" id="short-answer" placeholder="輸入答案" value="${esc(answer.value ?? "")}" ${answer.submitted ? "disabled" : ""}>`
    : `<div class="choices">${question.options.map((option, index) => {
      const selected = answer.value !== null && answer.value !== undefined && answer.value !== "" && Number(answer.value) === index;
      const resultClass = answer.submitted && index === Number(question.answer)
        ? "correct"
        : answer.submitted && selected && index !== Number(question.answer)
          ? "wrong"
          : "";
      return `<label class="choice ${selected ? "selected" : ""} ${resultClass}"><input type="radio" name="answer" value="${index}" ${selected ? "checked" : ""} ${answer.submitted ? "disabled" : ""}><span class="choice-letter">${String.fromCharCode(65 + index)}</span><span>${formatMath(option)}</span></label>`;
    }).join("")}</div>`;

  mount(`<section class="quiz-workspace"><header class="quiz-toolbar"><a href="#/" class="quiz-exit">離開任務</a><div><span>${esc(state.sessionLabel)}</span><b>第 ${state.index + 1} 題，共 ${state.session.length} 題</b></div><button class="button secondary compact" id="finish-quiz">交卷</button></header>
  <div class="quiz-progress"><i style="width:${progress}%"></i></div>
  <div class="quiz-columns"><aside class="question-navigator"><div class="navigator-head"><b>題目進度</b><span>${answeredCount} / ${state.session.length}</span></div><div class="question-map">${state.session.map((item, index) => {
    const itemAnswer = state.answers[item.id];
    const status = itemAnswer?.submitted ? (itemAnswer.correct ? "correct" : "wrong") : state.flagged.has(item.id) ? "flagged" : "";
    return `<button class="${index === state.index ? "active" : ""} ${status}" data-question-index="${index}" title="第 ${index + 1} 題">${index + 1}</button>`;
  }).join("")}</div><div class="navigator-key"><span><i class="done"></i>已作答</span><span><i class="flag"></i>稍後再看</span></div><div class="session-score"><span>本次答對</span><b>${correctCount} / ${answeredCount}</b></div></aside>
  <section class="question-stage">${adSlot("mobile-top")}<article class="question-card"><div class="question-meta"><span>${esc(question.level)} · ${esc(question.subject)} · ${esc(question.deck)}</span><span>${typeName(question.type)}</span></div><div class="question-title"><span>Q${state.index + 1}</span><h1>${formatMath(question.prompt)}</h1></div>${answerHtml}<div class="question-actions"><button class="button secondary" id="flag-question">${state.flagged.has(question.id) ? "取消標記" : "稍後再看"}</button><button class="button" id="submit-answer" ${answer.submitted || answer.value === null || answer.value === "" ? "disabled" : ""}>確認答案</button></div>${answer.submitted ? `<section class="answer-feedback ${answer.correct ? "ok" : "no"}"><b>${answer.correct ? "答對了" : "這題答錯了"}</b><p>正確答案：${formatMath(correctAnswerLabel(question))}</p><span>${formatMath(question.explanation)}</span></section>` : ""}</article>${adSlot("mobile-bottom")}<div class="question-pagination"><button class="button secondary" id="previous-question" ${state.index === 0 ? "disabled" : ""}>上一題</button><button class="button secondary" id="next-question">${state.index === state.session.length - 1 ? "回到第一題" : "下一題"}</button></div></section></div></section>`, false);

  root.querySelectorAll("[data-question-index]").forEach(button => button.onclick = () => {
    state.index = Number(button.dataset.questionIndex);
    saveActiveSession();
    renderQuiz();
  });
  root.querySelectorAll('input[name="answer"]').forEach(input => input.onchange = () => {
    state.answers[question.id] = { ...answer, value: Number(input.value) };
    saveActiveSession();
    renderQuiz();
  });
  const shortInput = root.querySelector("#short-answer");
  if (shortInput) shortInput.oninput = event => {
    state.answers[question.id] = { ...answer, value: event.target.value };
    root.querySelector("#submit-answer").disabled = !event.target.value.trim();
    saveActiveSession();
  };
  root.querySelector("#flag-question").onclick = () => {
    state.flagged.has(question.id) ? state.flagged.delete(question.id) : state.flagged.add(question.id);
    saveActiveSession();
    renderQuiz();
  };
  root.querySelector("#submit-answer").onclick = () => submitCurrentAnswer(question);
  root.querySelector("#previous-question").onclick = () => {
    state.index = Math.max(0, state.index - 1);
    saveActiveSession();
    renderQuiz();
  };
  root.querySelector("#next-question").onclick = () => {
    state.index = state.index === state.session.length - 1 ? 0 : state.index + 1;
    saveActiveSession();
    renderQuiz();
  };
  root.querySelector("#finish-quiz").onclick = requestFinish;
}

function submitCurrentAnswer(question) {
  const answer = state.answers[question.id];
  if (!answer || answer.submitted || answer.value === null || answer.value === "") return;
  const correct = answerIsCorrect(question, answer.value);
  state.answers[question.id] = { ...answer, submitted: true, correct };
  state.stats.answered += 1;
  if (correct) {
    state.stats.correct += 1;
    state.wrongIds.delete(question.id);
  } else {
    state.wrongIds.add(question.id);
  }
  saveStats();
  saveActiveSession();
  renderQuiz();
}

function requestFinish() {
  const unanswered = state.session.filter(question => !state.answers[question.id]?.submitted).length;
  if (unanswered && !confirm(`還有 ${unanswered} 題尚未作答，確定要交卷嗎？`)) return;
  finishSession();
}

function finishSession() {
  if (!state.session.length) return;
  if (!state.resultSaved) {
    const submitted = state.session.filter(question => state.answers[question.id]?.submitted);
    const correct = submitted.filter(question => state.answers[question.id]?.correct).length;
    const levels = values("level", state.session);
    const subjects = values("subject", state.session);
    state.history.unshift({
      id: Date.now(),
      label: state.sessionLabel,
      level: levels.length === 1 ? levels[0] : "混合",
      subject: subjects.length === 1 ? subjects[0] : "綜合",
      total: state.session.length,
      answered: submitted.length,
      correct,
      date: Date.now()
    });
    state.history = state.history.slice(0, 30);
    state.stats.sessions += 1;
    state.resultSaved = true;
    saveStats();
    saveActiveSession();
  }
  location.hash = "/result";
}

function renderResult() {
  if (!state.session.length || !state.resultSaved) {
    location.hash = "/";
    return;
  }
  const answered = state.session.filter(question => state.answers[question.id]?.submitted);
  const correct = answered.filter(question => state.answers[question.id]?.correct).length;
  const wrong = answered.filter(question => !state.answers[question.id]?.correct);
  const unanswered = state.session.length - answered.length;
  const rate = state.session.length ? Math.round(correct / state.session.length * 100) : 0;
  const unitBreakdown = values("deck", state.session).map(deck => {
    const questions = state.session.filter(question => question.deck === deck);
    const count = questions.filter(question => state.answers[question.id]?.correct).length;
    return `<div><span>${esc(deck)}</span><b>${count} / ${questions.length}</b></div>`;
  }).join("");

  mount(`${globalNav()}${pageHeading("MISSION REPORT", "本次任務完成", esc(state.sessionLabel))}
  <section class="result-hero"><div class="result-score"><span>正確率</span><b>${rate}%</b><small>${correct} 題答對 · ${wrong.length} 題答錯${unanswered ? ` · ${unanswered} 題未作答` : ""}</small></div><div class="result-breakdown"><h2>單元表現</h2>${unitBreakdown}</div></section>
  <section class="result-actions"><button class="button" id="retry-wrong" ${wrong.length ? "" : "disabled"}>重練本次錯題</button><button class="button secondary" id="repeat-mission">同範圍再來一組</button><a class="button secondary" href="#/setup/level">建立新任務</a></section>
  ${adSlot("mobile-top")}
  <section class="review-section"><div class="section-title"><div><p class="eyebrow">QUESTION REVIEW</p><h2>逐題檢查</h2></div></div><div class="review-list">${state.session.map((question, index) => {
    const answer = state.answers[question.id];
    const status = !answer?.submitted ? "skip" : answer.correct ? "ok" : "no";
    return `<details class="review-item ${status}" ${status === "no" ? "open" : ""}><summary><span>${index + 1}</span><b>${formatMath(question.prompt)}</b><small>${status === "ok" ? "答對" : status === "no" ? "答錯" : "未作答"}</small></summary><div><p>你的答案：${formatMath(answerLabel(question, answer?.value))}</p><p>正確答案：${formatMath(correctAnswerLabel(question))}</p><span>${formatMath(question.explanation)}</span></div></details>`;
  }).join("")}</div></section>`);
  root.querySelector("#retry-wrong").onclick = () => beginSession(wrong, "本次錯題重練");
  root.querySelector("#repeat-mission").onclick = () => {
    beginSession(state.session, state.sessionLabel);
  };
}

function startWrongPractice() {
  const questions = state.questions.filter(question => state.wrongIds.has(question.id));
  if (!questions.length) {
    location.hash = "/wrong";
    return;
  }
  state.setup.size = questions.length;
  beginSession(questions, "錯題本重練");
}

function renderWrongBook() {
  const questions = state.questions.filter(question => state.wrongIds.has(question.id));
  const grouped = values("deck", questions);
  mount(`${globalNav("/wrong")}${pageHeading("REVIEW QUEUE", "錯題本", "答錯的題目會自動加入；重新答對後會移出。")}
  <section class="wrong-toolbar"><div><b>${questions.length}</b><span>題待複習 · ${grouped.length} 個單元</span></div><button class="button" id="start-wrong" ${questions.length ? "" : "disabled"}>開始錯題重練</button></section>
  ${adSlot("mobile-top")}
  ${questions.length ? `<section class="wrong-list">${questions.map(question => `<article><div><span>${esc(question.level)} · ${esc(question.subject)} · ${esc(question.deck)}</span><b>${formatMath(question.prompt)}</b></div><button class="text-button" data-remove-wrong="${question.id}">移除</button></article>`).join("")}</section>` : `<div class="empty-state large"><b>目前沒有錯題</b><span>完成練習後，答錯的題目會集中在這裡。</span><a class="button" href="#/setup/level">建立練習任務</a></div>`}`);
  root.querySelector("#start-wrong").onclick = startWrongPractice;
  root.querySelectorAll("[data-remove-wrong]").forEach(button => button.onclick = () => {
    state.wrongIds.delete(button.dataset.removeWrong);
    saveStats();
    renderWrongBook();
  });
}

function renderProgress() {
  const rate = state.stats.answered ? Math.round(state.stats.correct / state.stats.answered * 100) : 0;
  mount(`${globalNav("/progress")}${pageHeading("LEARNING RECORD", "學習紀錄", "資料保存在目前裝置，協助你追蹤練習節奏。")}
  <section class="metric-row"><article><span>完成任務</span><b>${state.stats.sessions}</b><small>次</small></article><article><span>累積作答</span><b>${state.stats.answered}</b><small>題</small></article><article><span>累積答對</span><b>${state.stats.correct}</b><small>題</small></article><article><span>正確率</span><b>${rate}</b><small>%</small></article></section>
  ${adSlot("mobile-top")}
  <section class="history-section"><div class="section-title"><div><p class="eyebrow">MISSION HISTORY</p><h2>任務紀錄</h2></div><button class="text-button danger" id="reset-records">清除全部紀錄</button></div>${state.history.length ? `<div class="history-table"><div class="history-head"><span>任務</span><span>範圍</span><span>日期</span><span>成績</span></div>${state.history.map(item => `<article><b>${esc(item.label)}</b><span>${esc(item.level)} · ${esc(item.subject)}</span><time>${new Date(item.date).toLocaleDateString("zh-TW")}</time><strong>${item.correct} / ${item.total}</strong></article>`).join("")}</div>` : `<div class="empty-state">尚未完成任何任務。</div>`}</section>`);
  root.querySelector("#reset-records").onclick = () => {
    if (!confirm("確定清除所有作答紀錄與錯題本嗎？")) return;
    state.stats = { answered: 0, correct: 0, sessions: 0 };
    state.history = [];
    state.wrongIds.clear();
    saveStats();
    renderProgress();
  };
}

function renderRoute() {
  const route = routeName();
  if (route === "/") renderDashboard();
  else if (route === "/catalog" || route === "/library") renderCatalog();
  else if (route === "/setup/level" || route === "/build") renderSetupLevel();
  else if (route === "/setup/subject") renderSetupSubject();
  else if (route === "/setup/units") renderSetupUnits();
  else if (route === "/setup/options") renderSetupOptions();
  else if (route === "/setup/review") renderSetupReview();
  else if (route === "/quiz") renderQuiz();
  else if (route === "/result") renderResult();
  else if (route === "/wrong") renderWrongBook();
  else if (route === "/progress") renderProgress();
  else location.hash = "/";
  if (!route.startsWith("/quiz")) window.scrollTo({ top: 0, behavior: "instant" });
}

window.addEventListener("hashchange", renderRoute);
fetch("data/questions.json")
  .then(response => response.json())
  .then(data => {
    state.questions = Array.isArray(data) ? data.map(normalizeQuestion) : [];
    state.wrongIds = new Set([...state.wrongIds].filter(id => data.some(question => question.id === id)));
    restoreActiveSession();
    renderRoute();
  })
  .catch(() => mount('<div class="empty-state large"><b>題庫載入失敗</b><span>請重新整理頁面後再試一次。</span></div>'));
