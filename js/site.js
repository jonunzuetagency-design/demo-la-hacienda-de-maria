(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anim = root.classList.contains('anim');
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- WhatsApp con texto prellenado ---------- */
  var WA = 'https://wa.me/34607328187?text=' + encodeURIComponent('Hola, me gustaría consultar disponibilidad en La Hacienda de María. Somos __ personas, del __ al __. ¡Gracias!');
  $$('[data-wa]').forEach(function (a) { a.href = WA; a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- Intro portada ---------- */
  function go() { root.classList.add('loaded'); }
  var hero = $('.hero__media img');
  var fontsReady = d.fonts && d.fonts.ready ? d.fonts.ready : Promise.resolve();
  var imgReady = new Promise(function (r) { if (!hero || hero.complete) r(); else { hero.addEventListener('load', r); hero.addEventListener('error', r); } });
  Promise.all([fontsReady, imgReady]).then(function () { requestAnimationFrame(go); });
  setTimeout(go, 2200);

  /* ---------- Lenis (solo escritorio con puntero fino) ---------- */
  var lenis = null;
  function initLenis() {
    if (reduce || !window.Lenis || !matchMedia('(pointer:fine)').matches) return;
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
  if (window.Lenis) initLenis(); else window.addEventListener('load', initLenis);

  /* ---------- Anclas ---------- */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    var t = id === '#top' ? 0 : $(id);
    if (t === null) return;
    e.preventDefault();
    closeMenu();
    if (lenis) lenis.scrollTo(t, { offset: id === '#top' ? 0 : -10, duration: 1.4 });
    else if (t === 0) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ---------- Menú móvil ---------- */
  var burger = $('#burger'), menu = $('#menu');
  function closeMenu() {
    if (!root.classList.contains('menu-open')) return;
    root.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú');
    menu.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', function () {
    var open = !root.classList.contains('menu-open');
    if (!open) return closeMenu();
    root.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Cerrar menú');
    menu.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();
  });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---------- Reveals con escalonado ---------- */
  if (anim && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, i) {
        en.target.style.transitionDelay = (i * 0.09) + 's';
        en.target.classList.add('in');
        io.unobserve(en.target);
        setTimeout(function () { en.target.style.transitionDelay = ''; }, 1800 + i * 90);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Contadores ---------- */
  var counters = $$('[data-count]');
  if (anim && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, to = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, t0 = performance.now();
        (function step(t) {
          var p = clamp((t - t0) / 1600, 0, 1), e = 1 - Math.pow(1 - p, 4);
          el.textContent = (to * e).toFixed(dec).replace('.', ',');
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Manifiesto: palabras que se encienden ---------- */
  var words = $('#words'), wordEls = [];
  if (words) {
    var hl = ['trescientos', 'años', 'montañés', 'quince', 'casas', 'quedarse.'];
    words.innerHTML = words.textContent.trim().split(/\s+/).map(function (w) {
      var k = hl.indexOf(w.toLowerCase()) > -1 ? ' hl' : '';
      return '<span class="w' + k + '">' + w + '</span>';
    }).join(' ');
    wordEls = $$('.w', words);
  }

  /* ---------- Línea de los Picos ---------- */
  var ridge = $('#ridge'), ridgeLen = 0;
  if (ridge) { ridgeLen = ridge.getTotalLength(); ridge.style.strokeDasharray = ridgeLen; ridge.style.strokeDashoffset = anim ? ridgeLen : 0; }

  /* ---------- Materiales (sticky) ---------- */
  var matItems = $$('.mat__item'), matImgs = $$('.mat__frame img'), matN = $('#matN'), roman = ['I', 'II', 'III', 'IV'], matActive = 0;
  function setMat(i) {
    if (i === matActive) return; matActive = i;
    matItems.forEach(function (el, k) { el.classList.toggle('on', k === i); });
    matImgs.forEach(function (el, k) { el.classList.toggle('on', k <= i); });
    if (matN) matN.textContent = roman[i];
  }
  if (matItems[0]) matItems[0].classList.add('on');

  /* ---------- Tira horizontal (sticky + translate) ---------- */
  var hs = $('#hstrip'), track = $('#htrack'), hbar = $('#hbar'), hsW = 0, isDesk = false;
  function sizeStrip() {
    isDesk = innerWidth > 860 && !reduce;
    if (!hs) return;
    if (isDesk) {
      track.style.transform = '';
      hsW = Math.max(0, track.scrollWidth - innerWidth);
      hs.style.height = (hsW + innerHeight) + 'px';
    } else { hs.style.height = ''; hsW = 0; }
  }
  if (track && !isDesk) {
    track.addEventListener('scroll', function () {
      if (isDesk) return;
      var m = track.scrollWidth - track.clientWidth;
      hbar.style.transform = 'scaleX(' + (m > 0 ? track.scrollLeft / m : 0) + ')';
    }, { passive: true });
  }

  /* ---------- Parallax ---------- */
  var pars = $$('[data-par]');
  var iris = $('#iris'), irisImg = iris ? $('img', iris) : null, irisSticky = iris ? $('.spa__iris-sticky', iris) : null;
  var nav = $('#nav'), lastY = 0;

  /* ---------- Bucle de render: lee scrollY dentro del frame ---------- */
  var vh = innerHeight, prevY = -1, prevW = 0;
  function rect(el) { return el.getBoundingClientRect(); }
  function tick() {
    var y = window.scrollY;
    if (y !== prevY || innerWidth !== prevW) {
      prevY = y; prevW = innerWidth; vh = innerHeight;

      // nav
      if (!root.classList.contains('menu-open')) {
        nav.classList.toggle('is-solid', y > vh * 0.82);
        nav.classList.toggle('is-hidden', y > vh * 1.2 && y > lastY + 2);
        if (y < lastY - 2) nav.classList.remove('is-hidden');
      }
      lastY = y;

      if (!reduce) {
        pars.forEach(function (el) {
          var r = rect(el.parentNode);
          if (r.bottom < 0 || r.top > vh) return;
          var p = (r.top + r.height / 2 - vh / 2) / vh;
          el.style.transform = 'translate3d(0,' + (p * -100 * parseFloat(el.dataset.par)).toFixed(2) + 'px,0)';
        });
      }

      // palabras
      if (wordEls.length && anim) {
        var wr = rect(words), wp = clamp((vh * 0.85 - wr.top) / (wr.height + vh * 0.35), 0, 1);
        var n = Math.round(wp * wordEls.length);
        for (var i = 0; i < wordEls.length; i++) wordEls[i].classList.toggle('on', i < n);
      }

      // cresta
      if (ridge && anim) {
        var rr = rect(ridge.ownerSVGElement), rp = clamp((vh - rr.top) / (vh * 0.7), 0, 1);
        ridge.style.strokeDashoffset = (ridgeLen * (1 - rp)).toFixed(1);
      }

      // materiales
      if (matItems.length && innerWidth > 860) {
        var best = 0, bd = 1e9;
        matItems.forEach(function (el, k) { var r = rect(el), c = Math.abs(r.top + r.height / 2 - vh / 2); if (c < bd) { bd = c; best = k; } });
        setMat(best);
      }

      // tira horizontal
      if (hs && isDesk && hsW > 0) {
        var hr = rect(hs), hp = clamp(-hr.top / hsW, 0, 1);
        track.style.transform = 'translate3d(' + (-hp * hsW).toFixed(1) + 'px,0,0)';
        hbar.style.transform = 'scaleX(' + hp.toFixed(4) + ')';
      }

      // iris del spa
      if (iris && !reduce) {
        var ir = rect(iris), ip = clamp(-ir.top / (ir.height - vh), 0, 1);
        var e = 1 - Math.pow(1 - ip, 2);
        irisSticky.style.setProperty('--iris', (22 + e * 60).toFixed(2) + '%');
        irisSticky.style.setProperty('--iz', (1.25 - e * 0.25).toFixed(3));
        irisSticky.style.setProperty('--io', clamp((ip - 0.75) * 4, 0, 1).toFixed(2));
      }
    }
    requestAnimationFrame(tick);
  }

  function onResize() { sizeStrip(); prevY = -1; }
  window.addEventListener('resize', onResize);
  if ('ResizeObserver' in window && track) new ResizeObserver(onResize).observe(track);
  sizeStrip();
  requestAnimationFrame(tick);

  /* ---------- Capacidad (tabs) ---------- */
  var tabs = $$('.cap__tab'), panels = $$('.cap__panel');
  function selTab(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('on', on); t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      panels[k].classList.toggle('on', on);
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selTab(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); selTab((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); selTab((i + tabs.length - 1) % tabs.length, true); }
    });
  });

  /* ---------- Regla de distancias de Liébana ---------- */
  var rlis = $$('#ruler li'), rimg = $('#rulerImg'), rcap = $('#rulerCap'), rTimer;
  function selRuler(li) {
    if (li.classList.contains('on')) return;
    rlis.forEach(function (x) { x.classList.toggle('on', x === li); });
    var src = li.dataset.img, alt = li.dataset.alt;
    var cap = $('.ruler__name', li).textContent + ' · ' + $('.ruler__km', li).textContent;
    clearTimeout(rTimer);
    var pre = new Image(); pre.src = src;
    rimg.classList.add('swap');
    rTimer = setTimeout(function () {
      rimg.style.transition = 'none';
      rimg.src = src; rimg.alt = alt; rcap.textContent = cap;
      rimg.classList.add('swap'); void rimg.offsetWidth;
      rimg.style.transition = '';
      var show = function () { rimg.classList.remove('swap'); };
      if (pre.complete) requestAnimationFrame(show); else pre.onload = pre.onerror = show;
    }, reduce ? 0 : 450);
  }
  rlis.forEach(function (li) {
    var b = $('button', li);
    b.addEventListener('click', function () { selRuler(li); });
    if (matchMedia('(hover:hover)').matches) b.addEventListener('mouseenter', function () { selRuler(li); });
    b.addEventListener('focus', function () { selRuler(li); });
  });
  rlis.forEach(function (li) { var im = new Image(); im.loading = 'lazy'; setTimeout(function () { im.src = li.dataset.img; }, 3000); });

  /* ---------- Galería en bucle (auto + arrastre + pausa al hover) ---------- */
  var F = window.FOTOS || [];
  var rowA = F.filter(function (f) { return f.cat !== 'liebana'; });
  var rowB = F.filter(function (f) { return f.cat === 'liebana' || f.cat === 'casa'; }).reverse();
  $$('.marquee').forEach(function (mq, idx) {
    var list = idx === 0 ? rowA : rowB;
    var html = list.map(function (f) {
      return '<a href="galeria.html#' + f.id + '" draggable="false"' + (idx ? ' tabindex="-1"' : '') + '><img src="' + f.thumb + '" alt="' + (idx ? '' : f.alt) + '" loading="lazy" decoding="async" draggable="false"><span>' + f.alt + '</span></a>';
    }).join('');
    var tr = d.createElement('div'); tr.className = 'marquee__track';
    tr.innerHTML = html + html.replace(/<a /g, '<a tabindex="-1" aria-hidden="true" ');
    mq.appendChild(tr);

    var dir = +mq.dataset.dir, speed = +mq.dataset.speed, x = 0, W = 0, hover = false, drag = false, moved = 0, sx = 0, sy = 0, lx = 0, vel = 0, axis = null, visible = true;
    function measure() { W = tr.scrollWidth / 2; }
    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(tr);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(mq);
    mq.addEventListener('mouseenter', function () { hover = true; });
    mq.addEventListener('mouseleave', function () { hover = false; });
    mq.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      drag = true; moved = 0; axis = null; sx = lx = e.clientX; sy = e.clientY; vel = 0;
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - lx;
      if (axis === null) {
        if (Math.abs(e.clientX - sx) > 6 || Math.abs(e.clientY - sy) > 6) {
          axis = Math.abs(e.clientX - sx) > Math.abs(e.clientY - sy) ? 'x' : 'y';
          if (axis === 'x') mq.classList.add('is-drag'); else { drag = false; return; }
        } else return;
      }
      x += dx; vel = dx; lx = e.clientX; moved += Math.abs(dx);
    });
    function end() { if (!drag) return; drag = false; mq.classList.remove('is-drag'); }
    window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    mq.addEventListener('click', function (e) { if (moved > 8) { e.preventDefault(); e.stopPropagation(); } moved = 0; }, true);
    (function loop() {
      if (visible && W) {
        if (!drag) {
          vel *= 0.94;
          var auto = (hover || reduce) ? 0 : speed * dir * -1;
          x += auto + vel;
        }
        if (x <= -W) x += W; if (x > 0) x -= W;
        tr.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      }
      requestAnimationFrame(loop);
    })();
  });

  /* ---------- Reseñas ---------- */
  var R = [
    ['Oscar', '09/2025', 'Ha sido el sitio que escogimos Patricia y yo para casarnos y no hemos podido escoger mejor sitio. El alojamiento increíble y tanto Mari, Mariví y Jaime atentos a más no poder. No se puede describir con palabras lo que es. IMPRESIONANTE. Gracias por todo.'],
    ['Verónica Román Colina', '10/2026', 'Pasamos unos días maravillosos. Un sitio ideal con preciosas vistas para desconectar y disfrutar de la naturaleza. Cabe destacar el trato de Marivi, ha sido muy atenta y amable. Sin duda volveremos.'],
    ['Antonio Jiménez', '07/2026', 'Una estancia de ensueño. El personal encantador. El lugar idílico, todo muy bien mantenido y limpio. Repetiremos algún día.'],
    ['Gorka Gabaldon Eransus', '08/2025', 'Un lugar para desconectar y disfrutar del paisaje. Unos apartamentos muy bonitos y un espacio muy cuidado. Una atención muy buena por parte de todo el equipo de La Hacienda de María. ¡Volveremos seguro!'],
    ['Xabier Zabala', '08/2025', '¡Increíble casa rural! Precioso apartamento y un lugar tranquilo. Buena piscina. Vistas impresionantes y mucha tranquilidad. Pueblo tranquilo y bonito.'],
    ['Fernando Limón', '08/2025', 'Situada en un bonito entorno. Instalaciones muy bien cuidadas y bien mantenidas. Mucha limpieza en todas las instalaciones. El personal es muy amable. Muy recomendable.']
  ];
  var MINI = [
    ['Eneko L.', '09/2026', 'Atención y trato excepcional, instalaciones bien cuidadas, vistas increíbles y muy buena limpieza.'],
    ['Nacho Cabello', '09/2026', 'Perfecto para olvidarse de todo. Los apartamentos están totalmente equipados: sábanas, mantas, productos de limpieza, platos, vasos…'],
    ['J.A. Casado', '07/2025', 'Un lugar paradisíaco rodeado de montañas. Casas cómodas y buen servicio.'],
    ['Carlos', '07/2026', 'Un sitio estupendo y muy buen trato.']
  ];
  var slidesEl = $('#revSlides'), bar = $('#revBar'), cnt = $('#revCount'), stage = $('#revStage');
  if (slidesEl) {
    slidesEl.innerHTML = R.map(function (r, i) {
      var q = r[2].split(' ').map(function (w, k) { return '<span class="rw" style="transition-delay:' + Math.min(k * 0.018, 0.9).toFixed(3) + 's">' + w + '</span>'; }).join(' ');
      return '<figure class="rslide' + (i ? '' : ' on') + '" role="group" aria-roledescription="reseña" aria-label="' + (i + 1) + ' de ' + R.length + '"' + (i ? ' aria-hidden="true"' : '') + '><q>' + q + '</q><footer><span class="av" aria-hidden="true">' + r[0][0] + '</span><div><b>' + r[0] + '</b><span class="st" aria-label="5 estrellas">★★★★★</span> <span class="mono">Google · ' + r[1] + '</span></div></footer></figure>';
    }).join('');
    $('#revMini').innerHTML = MINI.map(function (r) {
      return '<li data-reveal><span class="st" aria-label="5 estrellas">★★★★★</span><p>«' + r[2] + '»</p><span class="mono">' + r[0] + ' · Google · ' + r[1] + '</span></li>';
    }).join('');
    if (anim && window.IntersectionObserver) $$('#revMini [data-reveal]').forEach(function (el) { io.observe(el); });
    else $$('#revMini [data-reveal]').forEach(function (el) { el.classList.add('in'); });

    var sl = $$('.rslide', slidesEl), cur = 0, DUR = 9000, t0 = performance.now(), paused = false, inView = false, acc = 0, last = performance.now();
    function show(n) {
      var prev = sl[cur];
      cur = (n + sl.length) % sl.length;
      prev.classList.remove('on'); prev.classList.add('out'); prev.setAttribute('aria-hidden', 'true');
      setTimeout(function () { prev.classList.remove('out'); }, 20);
      sl[cur].classList.add('on'); sl[cur].removeAttribute('aria-hidden');
      cnt.textContent = ('0' + (cur + 1)).slice(-2) + ' / ' + ('0' + sl.length).slice(-2);
      acc = 0;
    }
    $('#revNext').addEventListener('click', function () { show(cur + 1); });
    $('#revPrev').addEventListener('click', function () { show(cur - 1); });
    stage.addEventListener('mouseenter', function () { paused = true; });
    stage.addEventListener('mouseleave', function () { paused = false; });
    var tx = null;
    slidesEl.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    slidesEl.addEventListener('touchend', function (e) {
      if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1));
    });
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { inView = e[0].isIntersecting; }, { threshold: 0.3 }).observe(stage);
    cnt.textContent = '01 / ' + ('0' + sl.length).slice(-2);
    (function loop(t) {
      var dt = t - last; last = t;
      if (!paused && inView && !reduce) { acc += dt; if (acc >= DUR) show(cur + 1); }
      bar.style.transform = 'scaleX(' + clamp(acc / DUR, 0, 1).toFixed(4) + ')';
      requestAnimationFrame(loop);
    })(performance.now());
  }

  /* ---------- FAQ: apertura animada ---------- */
  $$('.faq__list details').forEach(function (dt) {
    var sum = $('summary', dt), body = $('div', dt);
    sum.addEventListener('click', function (e) {
      if (reduce) return;
      e.preventDefault();
      if (dt.open) {
        var h = body.scrollHeight;
        body.animate([{ height: h + 'px' }, { height: '0px' }], { duration: 420, easing: 'cubic-bezier(.65,0,.35,1)' }).onfinish = function () { dt.open = false; };
      } else {
        dt.open = true;
        var h2 = body.scrollHeight;
        body.animate([{ height: '0px' }, { height: h2 + 'px' }], { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)' });
      }
    });
  });
})();
