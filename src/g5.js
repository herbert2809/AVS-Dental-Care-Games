const PICS = { sun: 'I brush my teeth in the morning.', plate: 'I brush my teeth after meals.', calendar: 'I brush my teeth every day.', star: 'Your choice! Say your own sentence.' };
const keys = Object.keys(PICS);
for (let i = keys.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = keys[i]; keys[i] = keys[j]; keys[j] = t; }
const opened = keys.map(() => -1); // -1 closed, otherwise the team that opened it
let cur = -1;
const TINT = ['#FFE08A', '#BFE3FF', '#FFD0DC', '#C9F2D6'];
function draw() {
  $('#who').innerHTML = turnChip();
  $('#teeth').innerHTML = keys.map((k, i) => (opened[i] < 0
    ? `<button class="lucky" data-i="${i}" aria-label="Tooth ${i + 1}"><svg class="art" viewBox="0 0 200 200">${toothShape(TINT[i])}</svg><span class="num">${i + 1}</span></button>`
    : `<div class="lucky open"><svg class="art" viewBox="0 0 200 200">${toothShape('#FFFFFF')}</svg><span class="in">${art(k)}</span>
       <span class="turn tag" style="--c:${TEAMS[opened[i]].color}">${TEAMS[opened[i]].name}</span></div>`)).join('');
}
$('#teeth').addEventListener('click', (e) => {
  const b = e.target.closest('button.lucky'); if (!b) return;
  cur = +b.dataset.i; sfx.good();
  $('#who2').innerHTML = turnChip(); $('#pic').innerHTML = art(keys[cur]);
  $('#line').innerHTML = keys[cur] === 'star' ? PICS.star : '&nbsp;';
  $('#show').classList.toggle('hidden', keys[cur] === 'star');
  $('#qv').classList.remove('hidden');
});
$('#show').onclick = () => { $('#line').textContent = PICS[keys[cur]]; };
function close(point) {
  if (point) { addPoint(turn); sfx.good(); burst(); } else sfx.tap();
  opened[cur] = turn; $('#qv').classList.add('hidden');
  if (opened.every((o) => o >= 0)) { draw(); showFinish('Show me your posters!'); } else { nextTurn(); draw(); }
}
$('#give').onclick = () => close(true); $('#skip').onclick = () => close(false);
draw();
