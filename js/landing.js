/* Project Bloodline — js/landing.js | Landing interactions (menu + reveal + compatibility guide). */
lucide.createIcons();
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('navLinks').classList.toggle('open'));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* Compatibility — exact admin component logic (same ids: matrix, compatBtns, donateTo, receiveFrom, compatNote). */
(function () {
  if (typeof GROUPS === 'undefined' || typeof COMPAT === 'undefined') return;
  var activeCompat = 'O−';
  function badge(g) {
    return '<span class="badge ' + ((typeof BADGE !== 'undefined' && BADGE[g]) || 'g-op') + '">' + g + '</span>';
  }
  function renderMatrix() {
    var head = '<tr><th class="corner"></th>' + GROUPS.map(function (g) { return '<th>' + g + '</th>'; }).join('') + '</tr>';
    var body = GROUPS.map(function (rec) {
      return '<tr><th>' + rec + '</th>' + GROUPS.map(function (don) {
        var yes = COMPAT[rec].receiveFrom.indexOf(don) !== -1;
        var uni = don === 'O−' && yes;
        return '<td class="' + (yes ? 'yes' : '') + ' ' + (uni ? 'uni' : '') + '">' + (yes ? '+' : '') + '</td>';
      }).join('') + '</tr>';
    }).join('');
    document.getElementById('matrix').innerHTML = head + body;
  }
  function renderCompat() {
    document.getElementById('compatBtns').innerHTML = GROUPS.map(function (g) {
      return '<button class="chip' + (g === activeCompat ? ' active' : '') + '" data-c="' + g + '">' + g + '</button>';
    }).join('');
    var c = COMPAT[activeCompat];
    document.getElementById('donateTo').innerHTML = c.donateTo.map(badge).join('');
    document.getElementById('receiveFrom').innerHTML = c.receiveFrom.map(badge).join('');
    var note = activeCompat + ' red cells can be given to ' + c.donateTo.join(', ') + '.';
    if (activeCompat === 'O−') note = 'O− is the universal red-cell donor. It can be transfused to every group, which is why emergency stock is watched so closely.';
    if (activeCompat === 'AB+') note = 'AB+ is the universal red-cell recipient. It can receive from every group, but can donate only to other AB+ patients.';
    document.getElementById('compatNote').textContent = note;
    renderMatrix();
  }
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-c]');
    if (c) { activeCompat = c.getAttribute('data-c'); renderCompat(); }
  });
  renderCompat();
})();
