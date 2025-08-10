import { meetingRoles, tableTopics, words, themes, resources } from './data.js';

// Utility helpers
const qs = sel => document.querySelector(sel);
const qsa = sel => [...document.querySelectorAll(sel)];
const randItem = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => arr.map(v => ({ v, r: Math.random() })).sort((a,b)=>a.r-b.r).map(o=>o.v);

// State
let topicsState = [];
let revealedCount = 0;
let timerInterval = null;
let startTime = null;
let phaseTimes = { green: 5, yellow: 6, red: 7 };
let analytics = { enabled:false, screens:{}, events:{}, firstRun: Date.now() };
let toastTimeout; // moved up to avoid TDZ in toast()
let firstActionDone = { topics:false, wod:false, theme:false };
let clubsData = null;
let clubsLoaded = false;

// Navigation & theming
autoInit();
function autoInit(){
  setupNav();
  setupTheme();
  // Defer rendering of roles/resources until first view to reduce initial work
  hydrateState();
  attachActions();
  offlineWatcher();
}
function hydrateState(){
  const aSaved = JSON.parse(localStorage.getItem('tm-analytics')||'{}');
  if(aSaved && typeof aSaved==='object') analytics = { ...analytics, ...aSaved };
  try {
    const saved = JSON.parse(localStorage.getItem('tm-state')||'{}');
    if(saved.topicsState && Array.isArray(saved.topicsState)){
      topicsState = saved.topicsState;
      revealedCount = saved.revealedCount||0;
      restoreTopicsList();
    }
    if(saved.word){
      const match = words.find(w=> w.word === saved.word.word);
      if(match){
        const card = qs('#wodCard');
        card.innerHTML = `<span class="pos">${match.part}</span><h3>${match.word}</h3><p>${match.definition}</p><p><em>${match.usage}</em></p>`;
        card.dataset.word = match.word;
        qs('[data-action="speak-wod"]').disabled = false;
      }
    }
    if(saved.theme){
      const container = qs('#themeCard');
      container.innerHTML = `<h3>${saved.theme}</h3><p>Build Table Topics, speeches and evaluations around this concept.</p>`;
    }
    if(saved.phaseTimes){
      phaseTimes = saved.phaseTimes;
      ['green','yellow','red'].forEach(k=>{ const el = qs(`[name=${k}]`); if(el) el.value = phaseTimes[k]; });
    }
    // Resource section collapse state
    if(saved.resourcesCollapsed){
      const section = qs('#resourceSection');
      if(section){ section.classList.add('collapsed'); const btn = section.querySelector('[data-action="toggle-resources"]'); if(btn) btn.setAttribute('aria-expanded','false'); }
    }
  } catch(e){ console.warn('State hydrate failed', e); }
}
function persistState(extra={}){
  try {
    const data = {
      topicsState,
      revealedCount,
      word: (()=>{ const w = qs('#wodCard').dataset.word; if(!w) return null; return { word: w }; })(),
      theme: (()=>{ const h = qs('#themeCard h3'); return h? h.textContent: null; })(),
      phaseTimes,
  resourcesCollapsed: qs('#resourceSection')?.classList.contains('collapsed') || false,
      ...extra
    };
    localStorage.setItem('tm-state', JSON.stringify(data));
  } catch(e){ /* ignore */ }
}
function restoreTopicsList(){
  const list = qs('#topicsList');
  list.innerHTML='';
  topicsState.forEach((t,i)=>{
    const li = document.createElement('li');
    li.textContent = t;
    if(i>0 && i>=revealedCount) li.style.display='none';
    if(i<revealedCount) li.classList.add('revealed');
    list.appendChild(li);
  });
  qs('[data-action="reveal-next"]').disabled = revealedCount >= topicsState.length;
}
function setupNav(){
  const toggle = qs('#navToggle');
  const sidebar = qs('#sidebar');
  toggle.addEventListener('click', ()=>{
    const collapsed = sidebar.hasAttribute('data-collapsed');
    sidebar.toggleAttribute('data-collapsed');
    toggle.setAttribute('aria-expanded', String(!collapsed));
  });
  qsa('[data-view]').forEach(btn=>btn.addEventListener('click', (e)=>{
    const view = e.currentTarget.getAttribute('data-view');
    if(!view) return;
    activateScreen(view);
  }));
}
function activateScreen(name){
  qsa('[data-screen]').forEach(s=>{
    if(s.getAttribute('data-screen') === name) s.classList.add('active'); else s.classList.remove('active');
  });
  qsa('.nav-link').forEach(l=>{
    l.removeAttribute('aria-current');
    if(l.getAttribute('data-view') === name) l.setAttribute('aria-current','page');
  });
  if(window.innerWidth < 880) qs('#sidebar').setAttribute('data-collapsed','');
  qs('#main').focus();
  if(name==='dashboard') history.replaceState(null,'', location.pathname + location.search);
  else location.hash = name;
  trackScreen(name);
  // Lazy render when first needed
  if(name==='roles' && !qs('#roleGrid').hasChildNodes()) renderRoles();
  if(name==='resources' && !qs('#resourceList').hasChildNodes()) renderResources();
  if(name==='clubs' && !clubsLoaded) loadClubsData();
  updateFab(name);
}
function setupTheme(){
  const btn = qs('#themeToggle');
  const pref = localStorage.getItem('tm-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark':'light');
  setTheme(pref);
  btn.addEventListener('click', ()=> setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'));
  function setTheme(t){ document.documentElement.setAttribute('data-theme', t); localStorage.setItem('tm-theme', t); btn.textContent = t==='dark'?'☀️':'🌙'; }
}

// Roles
function renderRoles(){
  const grid = qs('#roleGrid');
  const tpl = qs('#roleTemplate');
  grid.innerHTML = '';
  meetingRoles.forEach(r=>{
    const clone = tpl.content.cloneNode(true);
    clone.querySelector('.role-name').textContent = r.name;
    clone.querySelector('.level').textContent = r.level;
    clone.querySelector('.role-summary').textContent = r.summary;
    clone.querySelector('.role-details').textContent = r.details;
    grid.appendChild(clone);
  });
}

// Table Topics
function generateTopics(count=8){
  topicsState = shuffle(tableTopics).slice(0,count);
  revealedCount = 0;
  const list = qs('#topicsList');
  list.innerHTML = '';
  topicsState.forEach((t,i)=>{
    const li = document.createElement('li');
    li.textContent = t; // hidden until reveal
    if(i>0) li.style.display = 'none';
    list.appendChild(li);
  });
  qs('[data-action="reveal-next"]').disabled = false;
  persistState();
  toast(`${topicsState.length} topics ready. Reveal first shown.`);
  if(!firstActionDone.topics){ firstActionDone.topics = true; activateScreen('topics'); }
}
function revealNext(){
  const listItems = qsa('#topicsList li');
  if(revealedCount < listItems.length){
    if(revealedCount>0) listItems[revealedCount].style.display = '';
    listItems[revealedCount].classList.add('revealed');
    revealedCount++;
  }
  if(revealedCount >= listItems.length) qs('[data-action="reveal-next"]').disabled = true;
  persistState();
}
function clearTopics(){
  qs('#topicsList').innerHTML='';
  topicsState=[]; revealedCount=0; qs('[data-action="reveal-next"]').disabled=true;
  persistState();
}

// Word of the Day
function generateWord(){
  const w = randItem(words);
  const card = qs('#wodCard');
  card.innerHTML = `<span class="pos">${w.part}</span><h3>${w.word}</h3><p>${w.definition}</p><p><em>${w.usage}</em></p>`;
  qs('[data-action="speak-wod"]').disabled = false;
  card.dataset.word = w.word;
  persistState();
  if(!firstActionDone.wod){ firstActionDone.wod = true; activateScreen('wod'); }
}
function speakWord(){
  const card = qs('#wodCard');
  const word = card.dataset.word; if(!word) return;
  const u = new SpeechSynthesisUtterance(word);
  speechSynthesis.speak(u);
}

// Themes
function generateTheme(){
  const theme = randItem(themes);
  const container = qs('#themeCard');
  container.innerHTML = `<h3>${theme}</h3><p>Build Table Topics, speeches and evaluations around this concept.</p>`;
  persistState();
  if(!firstActionDone.theme){ firstActionDone.theme = true; activateScreen('themes'); }
}

// Resources
function renderResources(){
  const ul = qs('#resourceList');
  ul.innerHTML = '';
  resources.forEach(r=>{
    const li = document.createElement('li');
    li.innerHTML = `<a href="${r.url}" target="_blank" rel="noopener">${r.name}</a>`;
    ul.appendChild(li);
  });
}

// Timer
function applyPreset(e){
  const opt = e.target.selectedOptions[0];
  if(opt.value === 'custom'){ qs('.time-fields').removeAttribute('data-custom-hidden'); return; }
  qs('.time-fields').setAttribute('data-custom-hidden','');
  phaseTimes.green = parseFloat(opt.dataset.green);
  phaseTimes.yellow = parseFloat(opt.dataset.yellow);
  phaseTimes.red = parseFloat(opt.dataset.red);
  ['green','yellow','red'].forEach((k,i)=> qs(`[name=${k}]`).value = phaseTimes[k]);
  persistState();
}
function startTimer(){
  if(timerInterval) return;
  startTime = performance.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 200);
  qs('[data-action="pause-timer"]').disabled = false;
  qs('[data-action="reset-timer"]').disabled = false;
}
function pauseTimer(){
  if(!timerInterval) return;
  clearInterval(timerInterval); timerInterval=null;
}
function resetTimer(){
  pauseTimer();
  startTime = null; qs('#timerDisplay').textContent='00:00';
  qs('#timerDisplay').removeAttribute('data-phase');
  qs('[data-action="pause-timer"]').disabled = true;
  qs('[data-action="reset-timer"]').disabled = true;
  persistState();
}
function updateTimer(){
  const now = performance.now();
  const elapsedSec = (now - startTime)/1000;
  const mm = Math.floor(elapsedSec/60).toString().padStart(2,'0');
  const ss = Math.floor(elapsedSec%60).toString().padStart(2,'0');
  const disp = qs('#timerDisplay');
  disp.textContent = `${mm}:${ss}`;
  const g=phaseTimes.green*60, y=phaseTimes.yellow*60, r=phaseTimes.red*60;
  if(elapsedSec >= r) disp.dataset.phase='red';
  else if(elapsedSec >= y) disp.dataset.phase='yellow';
  else if(elapsedSec >= g) disp.dataset.phase='green';
}

// Toast
function toast(msg){
  const el = qs('#toast');
  el.textContent = msg; el.hidden=false; el.setAttribute('data-show','');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(()=>{ el.removeAttribute('data-show'); setTimeout(()=> el.hidden=true, 400); }, 3200);
}

// Attach actions
function attachActions(){
  document.addEventListener('click', (e)=>{
    const action = e.target.getAttribute('data-action');
    if(!action) return;
    switch(action){
      case 'generate-topics': generateTopics(); break;
      case 'reveal-next': revealNext(); break;
      case 'clear-topics': clearTopics(); break;
      case 'generate-wod': generateWord(); break;
      case 'speak-wod': speakWord(); break;
      case 'generate-theme': generateTheme(); break;
      case 'start-timer': startTimer(); break;
      case 'pause-timer': pauseTimer(); break;
      case 'reset-timer': resetTimer(); break;
  case 'go-dashboard': activateScreen('dashboard'); break;
    case 'toggle-resources': toggleResources(); break;
  case 'reset-club-filters': resetClubFilters(); break;
    }
  if(action) trackEvent(action);
  });
  qs('#preset').addEventListener('change', applyPreset);
  // Dashboard quick buttons route
  // Initial feature samples
  // Lazy: don't auto-generate until user explicitly interacts
  persistState();
  const hash = location.hash.replace('#','');
  if(hash) activateScreen(hash);
  setupAnalyticsUI();
  trackScreen(hash||'dashboard');
}

// Offline / online indicator (toast reuse)
function offlineWatcher(){
  window.addEventListener('offline', ()=> toast('You are offline. Cached mode.'));
  window.addEventListener('online', ()=> toast('Back online.'));
}

// Analytics (local, privacy-friendly)
function setupAnalyticsUI(){
  const toggle = qs('#analyticsToggle');
  const exportBtn = qs('[data-action="export-analytics"]');
  const resetBtn = qs('[data-action="reset-analytics"]');
  if(!toggle) return;
  toggle.checked = !!analytics.enabled;
  updateAnalyticsButtons();
  toggle.addEventListener('change', ()=> {
    analytics.enabled = toggle.checked;
    saveAnalytics();
    updateAnalyticsButtons();
    toast(analytics.enabled? 'Analytics enabled locally':'Analytics disabled');
    refreshAnalyticsPanel();
  });
  document.addEventListener('click', e=>{
    const action = e.target.getAttribute('data-action');
    if(action==='export-analytics'){ exportAnalytics(); }
    if(action==='reset-analytics'){ resetAnalytics(); }
  });
  const panel = qs('#analyticsPanel');
  if(panel){ panel.addEventListener('toggle', ()=> panel.open && refreshAnalyticsPanel()); }
  refreshAnalyticsPanel();
}
function updateAnalyticsButtons(){
  const enabled = !!analytics.enabled;
  const exportBtn = qs('[data-action="export-analytics"]');
  const resetBtn = qs('[data-action="reset-analytics"]');
  if(exportBtn) exportBtn.disabled = !enabled;
  if(resetBtn) resetBtn.disabled = !enabled;
}
function trackScreen(name){ if(!analytics.enabled) return; analytics.screens[name]=(analytics.screens[name]||0)+1; saveAnalyticsDeferred(); }
function trackEvent(key){ if(!analytics.enabled) return; analytics.events[key]=(analytics.events[key]||0)+1; saveAnalyticsDeferred(); }
let analyticsSaveTimer;
function saveAnalyticsDeferred(){ clearTimeout(analyticsSaveTimer); analyticsSaveTimer=setTimeout(saveAnalytics,500); }
function saveAnalytics(){ try { localStorage.setItem('tm-analytics', JSON.stringify(analytics)); } catch(e){} }
function exportAnalytics(){ try { const blob = new Blob([JSON.stringify(analytics,null,2)], {type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='tm-analytics.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000); } catch(e){ toast('Export failed'); } }
function resetAnalytics(){ analytics = { enabled: analytics.enabled, screens:{}, events:{}, firstRun: Date.now() }; saveAnalytics(); refreshAnalyticsPanel(); toast('Analytics reset'); }
function refreshAnalyticsPanel(){ const pre = qs('#analyticsData'); if(!pre){ return; } pre.textContent = analytics.enabled? JSON.stringify(analytics,null,2): '(disabled)'; }

function toggleResources(){
  const section = qs('#resourceSection');
  section.classList.toggle('collapsed');
  const btn = section.querySelector('[data-action="toggle-resources"]');
  if(btn) btn.setAttribute('aria-expanded', String(!section.classList.contains('collapsed')));
  if(!qs('#resourceList').hasChildNodes()) renderResources();
  persistState();
}

// Clubs Data Explorer
async function loadClubsData(){
  const status = qs('#clubsStatus');
  if(status) status.textContent = 'Loading clubs CSV...';
  try {
    const res = await fetch('../data/d106_fy26.csv');
    if(!res.ok) throw new Error('HTTP '+res.status);
    const text = await res.text();
    clubsData = parseCSV(text);
    clubsLoaded = true;
    if(status) status.textContent = `Loaded ${clubsData.length} clubs.`;
    setupClubFilters();
    renderClubs();
  } catch(e){
    if(status) status.textContent = 'Failed to load clubs data.';
    recordError('clubs-load', e.message||e);
  }
}
function parseCSV(text){
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift().split(',');
  return lines.map(line=>{
    const cols = [];
    let cur = ''; let inQ = false;
    for(let i=0;i<line.length;i++){
      const ch = line[i];
      if(ch==='"'){ inQ = !inQ; continue; }
      if(ch===',' && !inQ){ cols.push(cur); cur=''; continue; }
      cur+=ch;
    }
    cols.push(cur);
    const obj = {};
    header.forEach((h,i)=> obj[h.trim()] = (cols[i]||'').trim());
    ['Membase','Memtdate','Goals','Years'].forEach(k=>{ if(obj[k] && !isNaN(obj[k])) obj[k] = Number(obj[k]); });
    return obj;
  });
}
function setupClubFilters(){
  const search = qs('#clubSearch');
  const day = qs('#clubDayFilter');
  const freq = qs('#clubFreqFilter');
  const minMem = qs('#clubMinMembers');
  const minGoals = qs('#clubMinGoals');
  [search, day, freq, minMem, minGoals].forEach(el=> el && el.addEventListener('input', debounce(renderClubs, 200)));
}
function resetClubFilters(){
  ['clubSearch','clubDayFilter','clubFreqFilter','clubMinMembers','clubMinGoals'].forEach(id=>{ const el = qs('#'+id); if(el) el.value=''; });
  renderClubs();
}
function renderClubs(){
  if(!clubsData) return; const tbody = qs('#clubsTable tbody'); if(!tbody) return;
  const searchTerm = qs('#clubSearch')?.value.toLowerCase().trim() || '';
  const day = qs('#clubDayFilter')?.value || '';
  const freq = qs('#clubFreqFilter')?.value || '';
  const minMem = parseInt(qs('#clubMinMembers')?.value||'0',10);
  const minGoals = parseInt(qs('#clubMinGoals')?.value||'0',10);
  let rows = clubsData.filter(r=>{
    if(day && r.Meetday !== day) return false;
    if(freq && r.Meetfreq !== freq) return false;
    if(minMem && Number(r.Membase) < minMem) return false;
    if(minGoals && Number(r.Goals) < minGoals) return false;
    if(searchTerm){
      const hay = `${r.Clubname} ${r.City} ${r.Area} ${r.Meetday} ${r.Meetfreq}`.toLowerCase();
      if(!hay.includes(searchTerm)) return false;
    }
    return true;
  });
  const status = qs('#clubsStatus');
  if(status) status.textContent = `${rows.length} match(es).`;
  rows.sort((a,b)=> (a.Area||'').localeCompare(b.Area||'') || (a.Clubname||'').localeCompare(b.Clubname||''));
  tbody.innerHTML = rows.slice(0,500).map(r=> `<tr data-club="${r.Club}"><td>${r.Area}</td><td>${r.Club}</td><td>${escapeHtml(r.Clubname)}</td><td>${escapeHtml(r.City)}</td><td>${r.Membase||''}</td><td>${r.Goals||''}</td><td>${r.Meetday}</td><td>${r.Meettime}</td><td>${r.Years||''}</td></tr>`).join('');
}
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
function debounce(fn, wait){ let t; return function(...args){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args), wait); }; }

// Signal readiness for fallback detection
// Global error monitoring (counts only when analytics enabled)
function recordError(kind, msg){
  try {
    console.warn(`[App ${kind}]`, msg);
    if(!analytics.enabled) return;
    const keyBase = (msg||'unknown').toString().trim().slice(0,120);
    const key = `error:${keyBase}`;
    analytics.events[key] = (analytics.events[key]||0)+1;
    saveAnalyticsDeferred();
  } catch(e){ /* swallow */ }
}
window.addEventListener('error', e=> recordError('error', e.message));
window.addEventListener('unhandledrejection', e=> {
  const reason = e.reason && (e.reason.message || e.reason.toString()) || 'unknown rejection';
  recordError('unhandledrejection', reason);
});

window.__tmAppReady = true;

function updateFab(screen){
  const fab = qs('#fabBack');
  if(!fab) return;
  const show = screen && screen !== 'dashboard' && window.innerWidth < 881;
  fab.hidden = !show;
}
window.addEventListener('resize', ()=>{
  const active = qsa('[data-screen].active')[0];
  updateFab(active? active.getAttribute('data-screen'): 'dashboard');
});
