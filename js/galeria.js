(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var $ = function (s) { return d.querySelector(s); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var F = window.FOTOS || [], C = window.CATS || {};

  var WA = 'https://wa.me/34607328187?text=' + encodeURIComponent('Hola, me gustaría consultar disponibilidad en La Hacienda de María. Somos __ personas, del __ al __. ¡Gracias!');
  d.querySelectorAll('[data-wa]').forEach(function (a) { a.href = WA; a.target = '_blank'; a.rel = 'noopener'; });

  $('#gTotal').textContent = F.length;

  /* Filtros */
  var cats = ['todo'].concat(Object.keys(C)), filter = 'todo';
  $('#gFilters').innerHTML = cats.map(function (c, i) {
    var n = c === 'todo' ? F.length : F.filter(function (f) { return f.cat === c; }).length;
    return '<button class="' + (i ? '' : 'on') + '" data-c="' + c + '" aria-pressed="' + (i ? 'false' : 'true') + '">' + (c === 'todo' ? 'Todas' : C[c]) + '<sup>' + n + '</sup></button>';
  }).join('');

  /* Mosaico */
  var grid = $('#gGrid');
  grid.innerHTML = F.map(function (f, i) {
    return '<button class="g-item" data-i="' + i + '" data-cat="' + f.cat + '" id="f-' + f.id + '" aria-label="Ampliar: ' + f.alt + '"><img src="' + f.thumb + '" alt="' + f.alt + '" loading="' + (i < 6 ? 'eager' : 'lazy') + '" decoding="async" width="900" height="600"><span><b>' + f.alt + '</b></span></button>';
  }).join('');
  var items = Array.prototype.slice.call(grid.children);
  items.forEach(function (b) { var im = b.querySelector('img'); im.addEventListener('load', function () { im.removeAttribute('width'); im.removeAttribute('height'); }); if (im.complete) { im.removeAttribute('width'); im.removeAttribute('height'); } });

  var anim = root.classList.contains('anim'), pend = anim ? items.slice() : [];
  d.querySelectorAll('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  if (!anim) items.forEach(function (b) { b.classList.add('in'); });
  function chk() {
    var k = 0, vh = innerHeight;
    pend = pend.filter(function (el) {
      if (el.classList.contains('hide')) return true;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.95 && r.bottom > 0) { el.style.transitionDelay = (k++ * 0.07) + 's'; el.classList.add('in'); return false; }
      return true;
    });
  }
  window.addEventListener('scroll', chk, { passive: true }); setInterval(chk, 300); chk();
  $('#gFilters').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    filter = b.dataset.c;
    this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    items.forEach(function (it) {
      var show = filter === 'todo' || it.dataset.cat === filter;
      it.classList.toggle('hide', !show);
      if (show && anim) { it.classList.remove('in'); it.style.transitionDelay = ''; if (pend.indexOf(it) < 0) pend.push(it); }
    });
  });

  $('#gFilters').addEventListener('click', function () { setTimeout(chk, 30); });
  /* Visor */
  var lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap'), cnt = $('#lbCount'), cur = 0, lastFocus = null;
  function visible() { return items.filter(function (it) { return !it.classList.contains('hide'); }).map(function (it) { return +it.dataset.i; }); }
  function render(i, dir) {
    cur = i;
    var f = F[i], list = visible(), pos = list.indexOf(i);
    var apply = function () {
      img.src = f.full; img.alt = f.alt; cap.textContent = f.alt + ' · ' + C[f.cat];
      cnt.textContent = (pos + 1) + ' / ' + list.length;
      if (history.replaceState) history.replaceState(null, '', '#' + f.id);
      var pre = new Image(); pre.src = f.full;
      var show = function () { img.classList.remove('swap', 'swap-l'); };
      if (pre.complete) requestAnimationFrame(show); else { pre.onload = pre.onerror = show; }
      [list[(pos + 1) % list.length], list[(pos - 1 + list.length) % list.length]].forEach(function (k) { var p = new Image(); p.src = F[k].full; });
    };
    if (dir && !reduce) {
      img.classList.add(dir > 0 ? 'swap-l' : 'swap');
      setTimeout(function () { img.style.transition = 'none'; img.classList.remove('swap', 'swap-l'); img.classList.add(dir > 0 ? 'swap' : 'swap-l'); void img.offsetWidth; img.style.transition = ''; apply(); }, 280);
    } else apply();
  }
  function open(i) {
    lastFocus = d.activeElement;
    lb.hidden = false; root.classList.add('lb-open');
    render(i);
    requestAnimationFrame(function () { requestAnimationFrame(function () { lb.classList.add('open'); }); });
    $('#lbClose').focus();
  }
  function close() {
    lb.classList.remove('open'); root.classList.remove('lb-open');
    setTimeout(function () { lb.hidden = true; }, reduce ? 0 : 650);
    if (history.replaceState) history.replaceState(null, '', location.pathname);
    if (lastFocus) lastFocus.focus();
  }
  function step(n) { var list = visible(), pos = list.indexOf(cur); render(list[(pos + n + list.length) % list.length], n); }

  grid.addEventListener('click', function (e) { var b = e.target.closest('.g-item'); if (b) open(+b.dataset.i); });
  $('#lbClose').addEventListener('click', close);
  $('#lbNext').addEventListener('click', function () { step(1); });
  $('#lbPrev').addEventListener('click', function () { step(-1); });
  $('#lbStage').addEventListener('click', function (e) { if (e.target === this) close(); });
  d.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {
      var f = [$('#lbClose'), $('#lbPrev'), $('#lbNext')], k = f.indexOf(d.activeElement);
      e.preventDefault(); f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
  var sx = null, sy = 0;
  $('#lbStage').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  $('#lbStage').addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  });

  /* Abrir desde la portada (galeria.html#h041) */
  var h = location.hash.replace('#', '');
  if (h) {
    var idx = -1; F.forEach(function (f, i) { if (f.id === h) idx = i; });
    if (idx > -1) setTimeout(function () { open(idx); }, 250);
  }
})();
