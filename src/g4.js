const SEGS = [
  { k: 'brushB', line: 'Brush your teeth.', good: 1 }, { k: 'candyB', line: 'Eat candy.', good: 0 },
  { k: 'dentistA', line: 'Go to see the dentist.', good: 1 }, { k: 'pencilB', line: 'Chew on pencils.', good: 0 },
  { k: 'sun', line: 'I brush my teeth in the morning.', good: 1 }, { k: 'plate', line: 'I brush my teeth after meals.', good: 1 },
  { k: 'calendar', line: 'I brush my teeth every day.', good: 1 }, { k: 'calendarStars', line: 'I brush my teeth every day.', good: 1 },
];
const ORDER = [0, 4, 1, 6, 2, 5, 3, 7]; // habits and time pictures alternate round the wheel
const FILL = ['#FFE08A', '#BFE3FF', '#FFD0DC', '#C9F2D6'];
const used = SEGS.map(() => false);
let rot = 0, cur = -1, busy = false, timer = null;
function wedge(i) {
  const a0 = (i * 45 - 22.5 - 90) * Math.PI / 180, a1 = (i * 45 + 22.5 - 90) * Math.PI / 180, r = 190;
  const p = (a) => `${(200 + r * Math.cos(a)).toFixed(1)} ${(200 + r * Math.sin(a)).toFixed(1)}`;
  const seg = SEGS[ORDER[i]];
  return `<g class="seg" data-pos="${i}" opacity="${used[ORDER[i]] ? 0.22 : 1}">
    <path d="M200 200 L${p(a0)} A${r} ${r} 0 0 1 ${p(a1)} Z" fill="${FILL[i % 4]}" stroke="#0E4B5A" stroke-width="5" stroke-linejoin="round"/>
    <g transform="rotate(${i * 45} 200 200) translate(154 28) scale(.46)">${artInner(seg.k)}</g></g>`;
}
function drawWheel() { $('#wheel').innerHTML = ORDER.map((_, i) => wedge(i)).join('') + '<circle cx="200" cy="200" r="190" fill="none" stroke="#0E4B5A" stroke-width="7"/>'; }
function setButtons(on) { ['#show', '#yes', '#no'].forEach((s) => { $(s).disabled = !on; }); }
function idle() {
  $('#who').innerHTML = turnChip(); $('#pic').innerHTML = '<span class="qm">?</span>'; $('#line').innerHTML = '&nbsp;';
  $('#s1').classList.remove('on'); $('#s2').classList.remove('on'); $('#bar').style.transition = 'none'; $('#bar').style.width = '0';
  setButtons(false); $('#spin').disabled = false;
}
$('#spin').onclick = () => {
  if (busy) return;
  const left = ORDER.map((s, i) => i).filter((i) => !used[ORDER[i]]); if (!left.length) return;
  busy = true; $('#spin').disabled = true; sfx.tap();
  const pos = left[Math.floor(Math.random() * left.length)];
  const target = ((-pos * 45 - rot) % 360 + 360) % 360;
  rot += 1440 + target; $('#wheel').style.transform = `rotate(${rot}deg)`;
  let ticks = 0; const tk = setInterval(() => { sfx.tick(); if (++ticks > 16) clearInterval(tk); }, 180);
  setTimeout(() => {
    cur = ORDER[pos]; busy = false; sfx.good();
    $('#pic').innerHTML = art(SEGS[cur].k); $('#pic').classList.remove('pulse'); void $('#pic').offsetWidth; $('#pic').classList.add('pulse');
    setButtons(true); $('#s1').classList.add('on');
    const bar = $('#bar'); bar.style.transition = 'none'; bar.style.width = '0'; void bar.offsetWidth; bar.style.transition = 'width 10s linear'; bar.style.width = '100%';
    clearTimeout(timer); timer = setTimeout(() => { $('#s1').classList.remove('on'); $('#s2').classList.add('on'); sfx.tap(); }, 10000);
  }, 3400);
};
$('#show').onclick = () => {
  const s = SEGS[cur]; if (!s) return;
  $('#line').innerHTML = `${s.line} <span class="${s.good ? 'goodc' : 'badc'}">${s.good ? 'Good!' : 'Bad!'}</span>`;
};
function finishSpin(point) {
  if (cur < 0) return;
  clearTimeout(timer); if (point) { addPoint(turn); sfx.good(); burst(); } else sfx.tap();
  used[cur] = true; cur = -1; drawWheel();
  if (used.every(Boolean)) { setButtons(false); $('#spin').disabled = true; showFinish('Super speaking!'); } else { nextTurn(); idle(); }
}
$('#yes').onclick = () => finishSpin(true); $('#no').onclick = () => finishSpin(false);
drawWheel(); idle();
