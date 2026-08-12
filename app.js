const state = {
  questions: [], filtered: [], session: [], index: 0, selected: null, submitted: false,
  levels: new Set(), types: new Set(["mcq", "short"]), decks: new Set(), search: "", sessionSize: 10,
  stats: JSON.parse(localStorage.getItem("knovatrix-quiz-stats") || '{"answered":0,"correct":0,"sessions":0,"streak":0}')
};
const root = document.querySelector("#app");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
const adSlot = placement => `<div class="ad-slot ad-slot-flow" data-ad-slot="${placement}" aria-label="贊助內容"></div>`;
const values = key => [...new Set(state.questions.map(question => question[key]))].sort((a,b) => String(a).localeCompare(String(b), "zh-Hant"));
const labelType = type => type === "short" ? "填充題" : "選擇題";
const saveStats = () => localStorage.setItem("knovatrix-quiz-stats", JSON.stringify(state.stats));
const normalize = text => String(text || "").trim().replace(/\s+/g, "").toLowerCase();

function syncQuestions() {
  const matchesSearch = question => !state.search || `${question.deck} ${question.subject} ${question.prompt}`.toLowerCase().includes(state.search.toLowerCase());
  state.filtered = state.questions.filter(question =>
    (!state.levels.size || state.levels.has(question.level)) &&
    (!state.types.size || state.types.has(question.type)) &&
    (!state.decks.size || state.decks.has(question.deck)) && matchesSearch(question)
  );
}
function toggleSet(set, value) { set.has(value) ? set.delete(value) : set.add(value); }
function shuffle(items) { return [...items].sort(() => Math.random() - .5); }
function selectionSummary() { return `${state.filtered.length} 題符合目前設定`; }

function renderHome() {
  const levels = values("level"), decks = values("deck");
  const unitChoices = decks.map(deck => {
    const sample = state.questions.find(question => question.deck === deck);
    const checked = state.decks.has(deck) ? "checked" : "";
    const count = state.questions.filter(question => question.deck === deck).length;
    return `<label class="unit-choice"><input type="checkbox" data-deck="${escapeHtml(deck)}" ${checked}><span><b>${escapeHtml(deck)}</b><small>${escapeHtml(sample.subject)} · ${escapeHtml(sample.level)} · ${count} 題</small></span></label>`;
  }).join("");
  root.innerHTML = `<section class="studio-hero"><div><p class="eyebrow">PRACTICE STUDIO</p><h1>自己組一場，真正適合你的練習。</h1><p class="lead">勾選要練的單元與題型，再建立一場練習任務。每一次作答，都會留在你的學習紀錄裡。</p></div><div class="streak-card"><span>累積答對</span><b>${state.stats.correct} 題</b><span>已完成 ${state.stats.sessions} 次練習</span></div></section>${adSlot("mobile-top")}<section class="mission-panel"><div class="panel-head"><div><p class="eyebrow">BUILD A MISSION</p><h2>建立練習任務</h2></div><p>${selectionSummary()}</p></div><div class="filter-grid"><section class="filter-section"><h3>學段</h3><p>可同時選擇多個學段</p><div class="chip-row">${levels.map(level => `<button class="filter-chip ${state.levels.has(level) ? "active" : ""}" data-level="${escapeHtml(level)}">${escapeHtml(level)}</button>`).join("")}</div></section><section class="filter-section"><h3>題目類型</h3><p>至少保留一種題型</p><div class="chip-row">${["mcq","short"].map(type => `<button class="filter-chip ${state.types.has(type) ? "active" : ""}" data-type="${type}">${labelType(type)}</button>`).join("")}</div></section></div><div class="unit-toolbar"><h3>選擇單元</h3><button class="text-button" id="clear-units">${state.decks.size ? "清除單元篩選" : "全選所有單元"}</button></div><div class="unit-list">${unitChoices}</div><div class="mission-footer"><div class="mission-summary"><b>${selectionSummary()}</b><br>每次練習 <input id="session-size" type="number" min="1" max="50" value="${state.sessionSize}" aria-label="每次練習題數"> 題，會自動隨機抽題。</div><button class="button" id="start-mission" ${state.filtered.length ? "" : "disabled"}>開始這場練習</button></div></section><section class="library"><div class="section-head"><div><p class="eyebrow">QUESTION LIBRARY</p><h2>題庫總覽</h2></div><p>${state.questions.length} 題已收錄</p></div><div class="question-library">${state.filtered.slice(0,12).map(question => `<div class="library-item"><span class="type-pill">${labelType(question.type)}</span><div><b>${escapeHtml(question.deck)}</b><small>${escapeHtml(question.subject)} · ${escapeHtml(question.prompt)}</small></div><span class="level-pill">${escapeHtml(question.level)}</span></div>`).join("") || `<div class="empty">目前沒有符合篩選條件的題目。</div>`}</div></section>`;
  root.querySelectorAll("[data-level]").forEach(button => button.onclick = () => { toggleSet(state.levels, button.dataset.level); syncQuestions(); renderHome(); });
  root.querySelectorAll("[data-type]").forEach(button => button.onclick = () => { if (state.types.size === 1 && state.types.has(button.dataset.type)) return; toggleSet(state.types, button.dataset.type); syncQuestions(); renderHome(); });
  root.querySelectorAll("[data-deck]").forEach(input => input.onchange = () => { toggleSet(state.decks, input.dataset.deck); syncQuestions(); renderHome(); });
  root.querySelector("#clear-units").onclick = () => { state.decks = state.decks.size ? new Set() : new Set(decks); syncQuestions(); renderHome(); };
  root.querySelector("#session-size").onchange = event => { state.sessionSize = Math.max(1, Math.min(50, Number(event.target.value) || 10)); event.target.value = state.sessionSize; };
  root.querySelector("#start-mission").onclick = startMission;
  window.KnovatrixAds?.mount();
}
function startMission() { syncQuestions(); state.session = shuffle(state.filtered).slice(0, Math.min(state.sessionSize, state.filtered.length)); state.index = 0; state.selected = null; state.submitted = false; location.hash = "/quiz"; }
function renderQuiz() {
  const question = state.session[state.index];
  if (!question) { location.hash = "/"; return; }
  const correct = question.type === "short" ? normalize(state.selected) === normalize(question.answer) : Number(state.selected) === Number(question.answer);
  const answerArea = question.type === "short"
    ? `<input class="short-answer" id="short-answer" inputmode="text" placeholder="輸入答案" value="${escapeHtml(state.selected || "")}" ${state.submitted ? "disabled" : ""}>`
    : question.options.map((option,index) => `<label class="choice ${state.submitted && index === question.answer ? "correct" : ""} ${state.submitted && state.selected === index && index !== question.answer ? "wrong" : ""} ${state.selected === index ? "selected" : ""}"><input type="radio" name="answer" value="${index}" ${state.selected === index ? "checked" : ""} ${state.submitted ? "disabled" : ""}>${escapeHtml(option)}</label>`).join("");
  const percent = Math.round(((state.index + (state.submitted ? 1 : 0)) / state.session.length) * 100);
  root.innerHTML = `<div class="quiz-shell"><section><div class="quiz-header"><div><p class="eyebrow">${escapeHtml(question.deck)}</p><h1>第 ${state.index + 1} 題</h1></div><span class="progress">${state.index + 1} / ${state.session.length}</span></div><div class="meter"><i style="width:${percent}%"></i></div>${adSlot("mobile-top")}<article class="question-card"><div class="question-meta"><span>${escapeHtml(question.subject)}</span><span>${labelType(question.type)}</span></div><div class="question-text">${escapeHtml(question.prompt)}</div><div class="choices">${answerArea}</div><div class="answer-row"><button class="button" id="submit" ${state.submitted ? "disabled" : ""}>確認答案</button><button class="button secondary" id="next" ${state.submitted ? "" : "disabled"}>${state.index === state.session.length - 1 ? "完成練習" : "下一題"}</button></div>${state.submitted ? `<div class="feedback ${correct ? "ok" : "no"}"><strong>${correct ? "答對了！" : "再想一下"}</strong><span>${escapeHtml(question.explanation)}</span></div>` : ""}</article>${adSlot("mobile-bottom")}</section><aside class="quiz-side"><div class="side-panel"><h3>本次表現</h3><div class="score">${state.stats.correct} <small>/ ${state.stats.answered}</small></div><p>累積答對題數</p></div><div class="side-panel"><h3>題目地圖</h3><div class="question-map">${state.session.map((_,index) => `<i class="${index < state.index || (index === state.index && state.submitted) ? "done" : ""}">${index + 1}</i>`).join("")}</div></div><div class="side-panel"><h3>來源</h3><p>${escapeHtml(question.source)}</p></div></aside></div>`;
  root.querySelectorAll('input[name="answer"]').forEach(input => input.onchange = () => { state.selected = Number(input.value); root.querySelectorAll(".choice").forEach(choice => choice.classList.remove("selected")); input.closest(".choice").classList.add("selected"); });
  const short = root.querySelector("#short-answer"); if (short) short.oninput = event => { state.selected = event.target.value; };
  root.querySelector("#submit").onclick = () => { if (state.selected === null || state.selected === "") return; state.submitted = true; state.stats.answered += 1; if (correct) state.stats.correct += 1; saveStats(); renderQuiz(); };
  root.querySelector("#next").onclick = () => { if (!state.submitted) return; if (state.index < state.session.length - 1) { state.index += 1; state.selected = null; state.submitted = false; renderQuiz(); } else { state.stats.sessions += 1; saveStats(); location.hash = "/progress"; } };
  window.KnovatrixAds?.mount();
}
function renderProgress() { const rate = state.stats.answered ? Math.round(state.stats.correct / state.stats.answered * 100) : 0; root.innerHTML = `<section class="studio-hero"><div><p class="eyebrow">LEARNING RECORD</p><h1>你的練習紀錄</h1><p class="lead">紀錄只保存在目前裝置，可隨時回到工作台建立下一場任務。</p></div></section>${adSlot("mobile-top")}<div class="history"><div class="history-item"><span>累積作答</span><b>${state.stats.answered} 題</b></div><div class="history-item"><span>答對題數</span><b>${state.stats.correct} 題</b></div><div class="history-item"><span>正確率</span><b>${rate}%</b></div></div><div class="answer-row"><button class="button secondary" id="reset">清除本機紀錄</button><a class="button" href="#/">建立練習任務</a></div>`; root.querySelector("#reset").onclick = () => { if (confirm("確定清除這台裝置的刷題紀錄？")) { state.stats = {answered:0,correct:0,sessions:0,streak:0}; saveStats(); renderProgress(); } }; window.KnovatrixAds?.mount(); }
function route() { const routeName = location.hash.slice(1).split("?")[0] || "/"; if (routeName === "/quiz") renderQuiz(); else if (routeName === "/progress") renderProgress(); else renderHome(); }
window.addEventListener("hashchange", route);
fetch("data/questions.json").then(response => response.json()).then(data => { state.questions = data; syncQuestions(); route(); }).catch(() => { root.innerHTML = '<div class="empty">題庫資料載入失敗，請稍後再試。</div>'; });
