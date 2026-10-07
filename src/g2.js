const PHRASE = { brushA: 'brush your teeth', candyA: 'eat candy', dentistA: 'go to see the dentist', pencilA: 'chew on pencils' };
const QS = [
  { t: 'dentistA', o: ['candyA', 'dentistA', 'pencilA', 'brushA'] },
  { t: 'candyA', o: ['brushA', 'pencilA', 'candyA', 'dentistA'] },
  { t: 'pencilA', o: ['pencilA', 'brushA', 'dentistA', 'candyA'] },
  { t: 'brushA', o: ['dentistA', 'candyA', 'brushA', 'pencilA'] },
];
let q = 0, first = true, locked = false;
document.querySelectorAll('[data-art]').forEach((n) => { n.innerHTML = art(n.dataset.art); });
function draw() {
  first = true; locked = false;
  $('#qn').textContent = `Listen! ${q + 1}`; $('#who').innerHTML = turnChip(); $('#said').innerHTML = '&nbsp;'; $('#next').classList.add('hidden');
  $('#opts').innerHTML = QS[q].o.map((k) => `<button class="opt" data-k="${k}" aria-label="Picture">${art(k)}</button>`).join('');
}
$('#opts').addEventListener('click', (e) => {
  const b = e.target.closest('button.opt'); if (!b || locked || b.classList.contains('wrong')) return;
  if (b.dataset.k === QS[q].t) {
    locked = true; b.classList.add('right', 'pulse'); $('#said').textContent = PHRASE[QS[q].t];
    if (first) { addPoint(turn); burst(); } sfx.good();
    $('#next').textContent = q === QS.length - 1 ? 'Finish' : 'Next'; $('#next').classList.remove('hidden');
  } else { first = false; b.classList.add('wrong', 'shake'); sfx.bad(); }
});
$('#next').onclick = () => { q++; if (q >= QS.length) { $('#next').classList.add('hidden'); showFinish('Well done!'); } else { nextTurn(); draw(); } };
draw();
