// Madison Mentor: view switching, Big availability/requests, Little search + random match
const $ = (s) => document.querySelector(s);
const views = ['start', 'big', 'little'];
let profile = null;

const requests = [
  { id: 1, name: 'Jamie Rivera', info: 'Sophomore · Biology', msg: 'Looking for help with CS 149 and getting comfortable with Python.', when: 'Tue, Sep 15 · 3:00–3:45 PM' },
  { id: 2, name: 'Sam Patel', info: 'Freshman · Computer science', msg: 'Would love advice on first-year classes and finding my people.', when: 'Thu, Sep 17 · 1:00–1:30 PM' },
];
const bigs = [
  { name: 'Alex Morgan', tag: 'CS 149 · Python', year: 'Junior', major: 'Computer science', bio: "Let's break down the tricky stuff. I help with Python, study habits, and finding your footing.", day: 'Mon', time: '2:00–4:00 PM' },
  { name: 'Jordan Lee', tag: 'MATH 235 · Calculus', year: 'Senior', major: 'Mathematics', bio: "From derivatives to exam prep, we'll find an approach that clicks for you.", day: 'Wed', time: '1:00–3:00 PM' },
  { name: 'Morgan Brooks', tag: 'BIO 140 · Lab prep', year: 'Senior', major: 'Biology', bio: 'Here for lab questions, bio study sessions, and figuring out the pre-health path.', day: 'Fri', time: '10:00 AM–12:00 PM' },
  { name: 'Riley Chen', tag: 'PSYC 101 · Intro', year: 'Junior', major: 'Psychology', bio: 'Study guides, research tips, and a friendly ear for first-years.', day: 'Tue', time: '3:00–5:00 PM' },
];
const slots = [{ day: 'Mon', time: '2:00–4:00 PM' }, { day: 'Wed', time: '2:00–5:00 PM' }, { day: 'Fri', time: '10:00 AM–12:00 PM' }];
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const selectedDays = new Set(['Mon', 'Wed', 'Fri']);

function show(view) {
  views.forEach((v) => ($('#' + v).hidden = v !== view));
  const inApp = view !== 'start';
  ['#role-badge', '#switch-role', '#mobile-bar'].forEach((s) => ($(s).hidden = !inApp));
  $('#user-name').textContent = inApp ? profile.name : '';
  $('#role-badge').textContent = view === 'big' ? 'Big workspace' : 'Little workspace';
  document.querySelectorAll('.user-first').forEach((e) => (e.textContent = profile?.name.split(' ')[0] || ''));
  window.scrollTo(0, 0);
}

// Start form
document.querySelectorAll('[name=role]').forEach((r) =>
  r.addEventListener('change', () => ($('#continue-btn').textContent = 'Continue as a ' + (r.value === 'big' ? 'Big' : 'Little'))));
$('#profile-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#name');
  if (!name.value.trim()) { name.classList.add('is-invalid'); name.focus(); return; }
  name.classList.remove('is-invalid');
  profile = { name: name.value.trim(), year: $('#year').value, major: $('#major').value, role: document.querySelector('[name=role]:checked').value };
  show(profile.role);
});
['#switch-role', '#mobile-switch'].forEach((s) => $(s).addEventListener('click', () => show('start')));
$('#mobile-home').addEventListener('click', () => show(profile.role));

// Big: requests
function renderRequests() {
  $('#stat-pending').textContent = requests.length;
  $('#requests').innerHTML = requests.length ? requests.map((r) => `
    <div class="request-item" data-id="${r.id}">
      <strong>${r.name}</strong> <small class="text-secondary">${r.info}</small>
      <p class="my-2">${r.msg}</p>
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <small class="text-secondary">${r.when}</small>
        <div class="d-flex gap-2"><button class="btn btn-soft btn-sm" data-act="decline">Decline</button>
        <button class="btn btn-primary btn-sm" data-act="accept">Accept Little</button></div>
      </div></div>`).join('') : '<p class="text-secondary mb-0">No pending requests. New ones will show up here.</p>';
}
$('#requests').addEventListener('click', (e) => {
  const act = e.target.dataset.act, card = e.target.closest('[data-id]');
  if (!act || !card) return;
  const i = requests.findIndex((r) => r.id == card.dataset.id);
  if (act === 'accept') $('#stat-littles').textContent = +$('#stat-littles').textContent + 1;
  requests.splice(i, 1);
  renderRequests();
});

// Big: availability
function renderDays() {
  $('#days').innerHTML = dayNames.map((d) => `<button type="button" class="day-btn" aria-pressed="${selectedDays.has(d)}" aria-label="${d}" data-day="${d}">${d[0]}</button>`).join('');
}
$('#days').addEventListener('click', (e) => {
  const d = e.target.dataset.day; if (!d) return;
  selectedDays.has(d) ? selectedDays.delete(d) : selectedDays.add(d);
  renderDays();
});
const hours = Array.from({ length: 25 }, (_, i) => 7 * 60 + i * 30).map((m) => {
  const h = Math.floor(m / 60), mm = m % 60 ? '30' : '00';
  return { m, label: `${h % 12 || 12}:${mm} ${h < 12 ? 'AM' : 'PM'}` };
});
['#start-time', '#end-time'].forEach((s, i) => ($(s).innerHTML = hours.map((h, j) => `<option value="${j}" ${j === (i ? 14 : 14 - 4 + 0) ? 'selected' : ''}>${h.label}</option>`).join('')));
$('#start-time').value = 14; $('#end-time').value = 18;
function renderSlots() {
  $('#slots').innerHTML = slots.map((s, i) => `<li class="slot d-flex justify-content-between align-items-center"><span><strong>${s.day}</strong> &nbsp;${s.time}</span>
    <button class="btn btn-sm btn-link text-secondary p-0" data-rm="${i}" aria-label="Remove ${s.day} ${s.time}">Remove</button></li>`).join('');
}
$('#add-slot').addEventListener('click', () => {
  const a = +$('#start-time').value, b = +$('#end-time').value, err = $('#add-error');
  if (!selectedDays.size) return (err.textContent = 'Pick at least one day.');
  if (b <= a) return (err.textContent = 'End time must be after start time.');
  err.textContent = '';
  dayNames.filter((d) => selectedDays.has(d)).forEach((day) => slots.push({ day, time: `${hours[a].label}–${hours[b].label}` }));
  renderSlots();
});
$('#slots').addEventListener('click', (e) => { if (e.target.dataset.rm) { slots.splice(+e.target.dataset.rm, 1); renderSlots(); } });

// Little: search + random match
const bigCard = (b) => `<div class="col-md-6 col-xl-4"><article class="mm-card h-100 d-flex flex-column gap-2">
  <div><span class="tag">${b.tag}</span></div>
  <h3 class="h5 mb-0">${b.name}</h3><small class="text-secondary">${b.year} · ${b.major}</small>
  <p class="mb-1">${b.bio}</p>
  <div class="dot small mb-2">● ${b.day} · ${b.time}</div>
  <div class="d-flex gap-2 mt-auto"><button class="btn btn-soft flex-fill" data-view="${b.name}">View profile</button>
  <button class="btn btn-primary flex-fill" data-req="${b.name}">Request tutoring</button></div></article></div>`;
$('#f-major').insertAdjacentHTML('beforeend', [...new Set(bigs.map((b) => b.major))].map((m) => `<option>${m}</option>`).join(''));
function search() {
  const q = $('#q').value.trim().toLowerCase(), m = $('#f-major').value, d = $('#f-day').value;
  const hits = bigs.filter((b) => (!q || [b.name, b.major, b.tag].join(' ').toLowerCase().includes(q)) && (!m || b.major === m) && (!d || b.day === d));
  $('#result-count').textContent = `${hits.length} Big${hits.length === 1 ? '' : 's'} available to help`;
  $('#bigs').innerHTML = hits.length ? hits.map(bigCard).join('') : '<p class="text-secondary">No Bigs match yet. Try a different course, major, or day.</p>';
}
$('#search-form').addEventListener('submit', (e) => { e.preventDefault(); search(); });
['#f-major', '#f-day'].forEach((s) => $(s).addEventListener('change', search));
$('#bigs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.req) { b.textContent = 'Request sent'; b.disabled = true; }
  if (b.dataset.view) { const p = bigs.find((x) => x.name === b.dataset.view); alert(`${p.name}\n${p.year} · ${p.major}\n\n${p.bio}`); }
});
$('#random-btn').addEventListener('click', () => {
  const b = bigs[Math.floor(Math.random() * bigs.length)], box = $('#random-result');
  box.hidden = false;
  box.innerHTML = `<h3 class="h5">Meet ${b.name}</h3><p class="mb-2">${b.year} · ${b.major}. ${b.bio}</p>
    <p class="dot small">● ${b.day} · ${b.time}</p>
    <button class="btn btn-primary me-2" data-req="${b.name}">Send a hello</button><button class="btn btn-soft" id="reroll">Try another</button>`;
  box.querySelector('[data-req]').onclick = (e) => { e.target.textContent = 'Request sent'; e.target.disabled = true; };
  box.querySelector('#reroll').onclick = () => $('#random-btn').click();
});

renderRequests(); renderDays(); renderSlots(); search();