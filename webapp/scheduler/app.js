const scheduler = window.TMScheduler;
const STORAGE_KEY = 'tm-scheduler-state';

const qs = (selector, scope = document) => scope.querySelector(selector);

const state = {
  clubName: '',
  startDate: new Date().toISOString().split('T')[0],
  profile: '',
  memberCount: 8,
  members: [],
  lastConfig: null,
  lastCsv: '',
};

const sampleMembers = [
  { name: 'Mary', goal: 'public_speaker', pathway: 'Presentation Mastery' },
  { name: 'Luke Skywalker', goal: 'public_speaker', pathway: '' },
  { name: 'Leia Organa', goal: 'leader', pathway: 'Dynamic Leadership' },
  { name: 'Han Solo', goal: 'balanced', pathway: '' },
  { name: 'Poe Dameron', goal: 'balanced', pathway: 'Engaging Humor' },
  { name: 'Ahsoka Tano', goal: 'leader', pathway: '' },
  { name: 'Rey Skywalker', goal: 'public_speaker', pathway: '' },
  { name: 'Finn', goal: 'balanced', pathway: '' },
];

const ROLE_HEADERS = ['Week', 'Date', ...scheduler.ROLES];

init();

function init() {
  if (!scheduler) {
    setStatus('Scheduler engine failed to load.', 'error');
    return;
  }

  hydrateState();
  bindEvents();
  syncMembersToCount(state.memberCount);
  populateForm();
  renderMembers();
  renderScheduleHeader();
  setStatus('Enter your roster details, then generate a schedule.');
}

function hydrateState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved && typeof saved === 'object') {
      state.clubName = typeof saved.clubName === 'string' ? saved.clubName : state.clubName;
      state.startDate = typeof saved.startDate === 'string' ? saved.startDate : state.startDate;
      state.profile = typeof saved.profile === 'string' ? saved.profile : state.profile;
      state.memberCount = Number.isInteger(saved.memberCount) ? saved.memberCount : state.memberCount;
      state.members = Array.isArray(saved.members) ? saved.members.map(sanitizeMember) : [];
    }
  } catch (error) {
    console.warn('Failed to restore scheduler state', error);
  }
}

function persistState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      clubName: state.clubName,
      startDate: state.startDate,
      profile: state.profile,
      memberCount: state.memberCount,
      members: state.members,
    })
  );
}

function bindEvents() {
  qs('#schedulerForm').addEventListener('submit', handleSubmit);
  qs('#applyCount').addEventListener('click', applyMemberCount);
  qs('#addMember').addEventListener('click', () => {
    state.members.push(blankMember());
    state.memberCount = state.members.length;
    populateForm();
    renderMembers();
    persistState();
  });
  qs('#loadSample').addEventListener('click', loadSample);
  qs('#resetForm').addEventListener('click', resetForm);
  qs('#downloadCsv').addEventListener('click', downloadCsv);
  qs('#copyJson').addEventListener('click', copyJsonConfig);
  qs('#downloadConfig').addEventListener('click', downloadConfig);
  qs('#memberRoster').addEventListener('click', handleRosterClick);
  qs('#memberRoster').addEventListener('input', handleRosterInput);
  ['#clubName', '#startDate', '#profile', '#memberCount'].forEach((selector) => {
    qs(selector).addEventListener('input', handleTopLevelInput);
  });
}

function populateForm() {
  qs('#clubName').value = state.clubName;
  qs('#startDate').value = state.startDate;
  qs('#profile').value = state.profile;
  qs('#memberCount').value = state.memberCount;
  updateRosterMeta();
}

function handleTopLevelInput(event) {
  const { id, value } = event.target;
  if (id === 'clubName') state.clubName = value;
  if (id === 'startDate') state.startDate = value;
  if (id === 'profile') state.profile = value;
  if (id === 'memberCount') state.memberCount = clampCount(value);
  persistState();
}

function applyMemberCount() {
  state.memberCount = clampCount(qs('#memberCount').value);
  syncMembersToCount(state.memberCount);
  populateForm();
  renderMembers();
  persistState();
  setStatus(`Roster sized to ${state.memberCount} member${state.memberCount === 1 ? '' : 's'}.`);
}

function syncMembersToCount(count) {
  const target = Math.max(1, count || 1);
  while (state.members.length < target) state.members.push(blankMember());
  if (state.members.length > target) state.members = state.members.slice(0, target);
  state.memberCount = target;
}

function renderMembers() {
  const roster = qs('#memberRoster');
  const template = qs('#memberRowTemplate');
  roster.innerHTML = '';

  state.members.forEach((member, index) => {
    const fragment = template.content.cloneNode(true);
    const card = qs('.member-card', fragment);
    qs('.member-index', card).textContent = String(index + 1).padStart(2, '0');
    qs('[name="memberName"]', card).value = member.name;
    qs('[name="memberGoal"]', card).value = member.goal;
    qs('[name="memberPathway"]', card).value = member.pathway;
    card.dataset.index = String(index);
    roster.appendChild(fragment);
  });

  updateRosterMeta();
}

function handleRosterInput(event) {
  const card = event.target.closest('.member-card');
  if (!card) return;
  const index = Number(card.dataset.index);
  if (Number.isNaN(index) || !state.members[index]) return;

  const member = state.members[index];
  if (event.target.name === 'memberName') member.name = event.target.value;
  if (event.target.name === 'memberGoal') member.goal = event.target.value;
  if (event.target.name === 'memberPathway') member.pathway = event.target.value;
  persistState();
  updateRosterMeta();
}

function handleRosterClick(event) {
  const action = event.target.getAttribute('data-action');
  if (action !== 'remove-member') return;
  const card = event.target.closest('.member-card');
  if (!card) return;
  const index = Number(card.dataset.index);
  state.members.splice(index, 1);
  state.memberCount = Math.max(1, state.members.length);
  if (state.members.length === 0) state.members.push(blankMember());
  state.memberCount = state.members.length;
  populateForm();
  renderMembers();
  persistState();
}

function handleSubmit(event) {
  event.preventDefault();
  syncTopLevelFields();

  const validationMessage = validateState();
  if (validationMessage) {
    setStatus(validationMessage, 'error');
    return;
  }

  const config = buildConfig();
  const result = scheduler.generateSchedule(config, { profile: state.profile || undefined });
  state.lastConfig = config;
  state.lastCsv = scheduler.toCSV(result.schedule);
  persistState();
  renderResults(config, result);
  setStatus(`Generated a ${result.schedule.length}-week schedule for ${config.members.length} members.`, 'success');
}

function syncTopLevelFields() {
  state.clubName = qs('#clubName').value.trim();
  state.startDate = qs('#startDate').value;
  state.profile = qs('#profile').value;
  state.memberCount = clampCount(qs('#memberCount').value);
  syncMembersToCount(state.memberCount);
}

function validateState() {
  if (!state.startDate) return 'Select a first meeting date.';
  if (!state.members.length) return 'Add at least one member.';

  const names = [];
  for (let index = 0; index < state.members.length; index += 1) {
    const member = sanitizeMember(state.members[index]);
    state.members[index] = member;
    if (!member.name) return `Enter a name for member ${index + 1}.`;
    const normalizedName = member.name.toLowerCase();
    if (names.includes(normalizedName)) return `Member names must be unique. Duplicate found: ${member.name}.`;
    names.push(normalizedName);
  }

  return '';
}

function buildConfig() {
  return {
    club_name: state.clubName,
    start_date: state.startDate,
    members: state.members.map((member) => ({
      name: member.name.trim(),
      goal: scheduler.normalizeGoal(member.goal),
      pathway: member.pathway.trim(),
    })),
  };
}

function renderResults(config, result) {
  qs('#emptyState').hidden = true;
  qs('#resultsContent').hidden = false;
  qs('#downloadConfig').disabled = false;

  renderResultCards(config, result);
  renderMemberSummary(result);
  renderScheduleTable(result.schedule);
}

function renderResultCards(config, result) {
  const cards = [
    { label: 'Members', value: String(config.members.length) },
    { label: 'Weeks', value: String(result.schedule.length) },
    { label: 'Swaps', value: String(result.swapsApplied) },
    { label: 'Profile', value: state.profile === 'scale' ? 'Scale' : 'Standard' },
  ];

  qs('#resultCards').innerHTML = cards
    .map((card) => `<article class="result-card"><strong>${escapeHtml(card.value)}</strong><span>${escapeHtml(card.label)}</span></article>`)
    .join('');
}

function renderMemberSummary(result) {
  const summary = scheduler.summarizeAssignments(result.membersWithTargets, result.schedule);
  qs('#memberSummary').innerHTML = summary
    .map((member) => {
      const totalActual = scheduler.ROLES.reduce((sum, role) => sum + (member.counts[role] || 0), 0);
      const totalTarget = scheduler.ROLES.reduce((sum, role) => sum + (member.targets[role] || 0), 0);
      const focusRoles = [...scheduler.ROLES]
        .sort((a, b) => (member.targets[b] || 0) - (member.targets[a] || 0))
        .slice(0, 3)
        .map((role) => `<span>${escapeHtml(role)} ${member.counts[role] || 0}/${member.targets[role] || 0}</span>`)
        .join('');

      return [
        '<article class="member-summary-card">',
        `<h4>${escapeHtml(member.name)}</h4>`,
        `<p><strong>Goal:</strong> ${escapeHtml(goalLabel(member.goal))}</p>`,
        `<p><strong>Assignments:</strong> ${totalActual}/${totalTarget}</p>`,
        member.pathway ? `<p><strong>Pathway:</strong> ${escapeHtml(member.pathway)}</p>` : '<p><strong>Pathway:</strong> Not provided</p>',
        `<div class="focus-roles">${focusRoles}</div>`,
        '</article>',
      ].join('');
    })
    .join('');
}

function renderScheduleHeader() {
  const table = qs('#scheduleTable thead tr');
  table.innerHTML = ROLE_HEADERS.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join('');
}

function renderScheduleTable(schedule) {
  const tbody = qs('#scheduleTable tbody');
  tbody.innerHTML = schedule
    .map((row) => {
      const values = [row.week, row.date, ...scheduler.ROLES.map((role) => row[role] || '')];
      return `<tr>${values.map((value) => `<td>${escapeHtml(String(value))}</td>`).join('')}</tr>`;
    })
    .join('');
}

function downloadCsv() {
  if (!state.lastCsv) return;
  downloadBlob(state.lastCsv, `${buildFileStem()}.csv`, 'text/csv;charset=utf-8');
}

function downloadConfig() {
  if (!state.lastConfig) return;
  downloadBlob(JSON.stringify(state.lastConfig, null, 2), `${buildFileStem()}_config.json`, 'application/json');
}

async function copyJsonConfig() {
  if (!state.lastConfig) return;
  const text = JSON.stringify(state.lastConfig, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    setStatus('Config JSON copied to clipboard.', 'success');
  } catch (error) {
    setStatus('Clipboard copy failed. Use the config download instead.', 'error');
  }
}

function loadSample() {
  state.clubName = 'Star Wars Advanced Speakers';
  state.startDate = '2026-05-17';
  state.profile = 'scale';
  state.members = sampleMembers.map(sanitizeMember);
  state.memberCount = state.members.length;
  populateForm();
  renderMembers();
  persistState();
  setStatus('Sample club loaded. Review the roster or generate immediately.');
}

function resetForm() {
  state.clubName = '';
  state.startDate = new Date().toISOString().split('T')[0];
  state.profile = '';
  state.memberCount = 8;
  state.members = [];
  state.lastConfig = null;
  state.lastCsv = '';
  syncMembersToCount(state.memberCount);
  populateForm();
  renderMembers();
  qs('#emptyState').hidden = false;
  qs('#resultsContent').hidden = true;
  qs('#downloadConfig').disabled = true;
  persistState();
  setStatus('Scheduler form reset.');
}

function updateRosterMeta() {
  const filled = state.members.filter((member) => member.name.trim()).length;
  qs('#rosterMeta').textContent = `${filled} of ${state.members.length} member slots filled`;
}

function setStatus(message, variant) {
  const status = qs('#formStatus');
  status.textContent = message;
  if (variant) status.dataset.variant = variant;
  else delete status.dataset.variant;
}

function blankMember() {
  return { name: '', goal: 'balanced', pathway: '' };
}

function sanitizeMember(member) {
  return {
    name: typeof member?.name === 'string' ? member.name : '',
    goal: scheduler.normalizeGoal(member?.goal),
    pathway: typeof member?.pathway === 'string' ? member.pathway : '',
  };
}

function clampCount(value) {
  const count = Math.max(1, Math.min(80, parseInt(value || '1', 10) || 1));
  return count;
}

function goalLabel(goal) {
  const match = scheduler.GOAL_OPTIONS.find((option) => option.value === scheduler.normalizeGoal(goal));
  return match ? match.label : 'Both';
}

function buildFileStem() {
  const clubStem = (state.clubName || 'toastmasters_schedule')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${clubStem || 'toastmasters_schedule'}_${state.startDate || 'schedule'}`;
}

function downloadBlob(content, fileName, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}