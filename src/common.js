// Shared engine: four teams, scores kept between games, sounds, finish screen.
const TEAMS = [
  { name: 'Red', color: 'var(--red)' }, { name: 'Blue', color: 'var(--blue)' },
  { name: 'Green', color: 'var(--green)' }, { name: 'Yellow', color: 'var(--yellow)' },
];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: scores stay for this page only */ } },
};
let scores = store.get('dentalCareScores', [0, 0, 0, 0]);
if (!Array.isArray(scores) || scores.length !== 4) scores = [0, 0, 0, 0];
let turn = 0;
const $ = (s, el) => (el || document).querySelector(s);
const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; };

function renderTeams() {
  const box = $('#teams'); if (!box) return;
  box.innerHTML = TEAMS.map((t, i) => `<div class="team ${i === turn ? 'on' : ''}" style="--c:${t.color}" data-i="${i}">
    <span class="nm">${t.name}</span><span class="sc">${scores[i]}</span>
    <span class="adj"><button data-d="1" aria-label="Add a point to ${t.name} Team">+</button><button data-d="-1" aria-label="Take a point from ${t.name} Team">−</button></span></div>`).join('');
}
function addPoint(i, n) {
  scores[i] = Math.max(0, scores[i] + (n === undefined ? 1 : n)); store.set('dentalCareScores', scores); renderTeams();
  const t = document.querySelector(`.team[data-i="${i}"]`); if (t) t.classList.add('pop');
}
function setTurn(i) { turn = i % 4; renderTeams(); document.dispatchEvent(new CustomEvent('turn')); }
function nextTurn() { setTurn(turn + 1); }
function turnChip() { return `<span class="turn" style="--c:${TEAMS[turn].color}">${TEAMS[turn].name} Team</span>`; }

let AC;
function tone(freq, dur, type, when, gain) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.value = freq; o.connect(g); g.connect(AC.destination);
    const t = AC.currentTime + (when || 0);
    g.gain.setValueAtTime(gain || 0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch (e) { /* no sound available */ }
}
const sfx = {
  good() { tone(523, .15); tone(659, .15, 'sine', .12); tone(784, .3, 'sine', .24); },
  bad() { tone(196, .25, 'sawtooth', 0, .07); tone(147, .35, 'sawtooth', .18, .07); },
  tap() { tone(440, .07, 'triangle'); },
  tick() { tone(880, .05, 'square', 0, .05); },
  win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, .25, 'triangle', i * .14)); },
};

function burst() {
  const box = el('<div class="stars"></div>');
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2, d = 25 + Math.random() * 30;
    const s = el(`<i style="left:50%;top:45%;--dx:${(Math.cos(a) * d).toFixed(0)}vmin;--dy:${(Math.sin(a) * d).toFixed(0)}vmin"><svg viewBox="0 0 200 200">${star(100, 100, 90)}</svg></i>`);
    box.appendChild(s);
  }
  $('#stage').appendChild(box); setTimeout(() => box.remove(), 1200);
}

function showFinish(title) {
  const max = Math.max.apply(null, scores);
  const rows = TEAMS.map((t, i) => `<div class="res">${scores[i] === max && max > 0 ? `<svg class="crown" viewBox="0 0 200 200">${star(100, 100, 90)}</svg>` : '<span class="crown"></span>'}
    <div class="col" style="--c:${t.color};height:${8 + (max ? scores[i] / max : 0) * 22}vmin">${scores[i]}</div><span>${t.name}</span></div>`).join('');
  const o = el(`<div class="over"><div class="panel card finish"><h2>${title || 'Great job!'}</h2><div class="rows">${rows}</div>
    <div style="display:flex;gap:2vmin"><button class="btn" id="finAgain">Play again</button><a class="btn go" href="index.html" style="text-decoration:none">All games</a></div></div></div>`);
  $('#stage').appendChild(o); $('#finAgain').onclick = () => location.reload(); sfx.win(); burst();
}

document.addEventListener('DOMContentLoaded', () => {
  renderTeams();
  const box = $('#teams');
  if (box) box.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    addPoint(+b.closest('.team').dataset.i, +b.dataset.d); sfx.tap();
  });
  const again = $('#btnAgain'); if (again) again.onclick = () => location.reload();
  const full = $('#btnFull'); if (full) full.onclick = () => {
    if (document.fullscreenElement) document.exitFullscreen(); else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
  };
  const rs = $('#btnScores'); let armed = 0;
  if (rs) rs.onclick = () => {
    if (Date.now() - armed < 3000) { scores = [0, 0, 0, 0]; store.set('dentalCareScores', scores); renderTeams(); rs.textContent = 'Scores are 0'; armed = 0; setTimeout(() => { rs.textContent = 'Reset scores'; }, 1500); }
    else { armed = Date.now(); rs.textContent = 'Tap again to reset'; setTimeout(() => { if (armed) { rs.textContent = 'Reset scores'; armed = 0; } }, 3000); }
  };
});
