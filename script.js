/* Hairway to Heaven: sparkles, reveals and little joys */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const GOLDS = ['#FFD95A', '#F5B301', '#FF8A00', '#FF5E7E', '#FFC93C'];
  const BURST = [...GOLDS, '#FFF3B0'];
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Twinkling background stars ---------- */
  document.querySelectorAll('[data-stars]').forEach((box) => {
    const count = parseInt(box.dataset.stars, 10) || 16;
    const palette = (box.dataset.colors || '').split(',').filter(Boolean);
    const colors = palette.length ? palette : GOLDS.slice(0, 4);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('i');
      s.style.left = rand(2, 98).toFixed(1) + '%';
      s.style.top = rand(2, 98).toFixed(1) + '%';
      s.style.setProperty('--s', rand(6, 16).toFixed(1) + 'px');
      s.style.setProperty('--t', rand(2.4, 5.5).toFixed(2) + 's');
      s.style.setProperty('--dl', (-rand(0, 5)).toFixed(2) + 's');
      s.style.setProperty('--c', pick(colors));
      frag.appendChild(s);
    }
    box.appendChild(frag);
  });

  /* ---------- Scroll reveal ---------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Rotating "you'll leave feeling..." word ---------- */
  const rotator = document.querySelector('[data-rotate]');
  if (rotator) {
    const words = [...rotator.children];
    let i = 0;
    words[0].classList.add('on');
    if (!reduceMotion && words.length > 1) {
      setInterval(() => {
        const current = words[i];
        i = (i + 1) % words.length;
        const next = words[i];
        current.classList.replace('on', 'off');
        next.classList.remove('off');
        next.classList.add('on');
        setTimeout(() => current.classList.remove('off'), 800);
      }, 2400);
    }
  }

  if (reduceMotion) return;

  /* ---------- Sparkle particles ---------- */
  const layer = document.querySelector('.sparkle-layer');
  const MAX_SPARKS = 70;
  let live = 0;

  function spark(x, y, opts = {}) {
    if (!layer || live >= MAX_SPARKS) return;
    const el = document.createElement('span');
    const size = opts.size ?? rand(6, 13);
    const angle = opts.angle ?? rand(0, Math.PI * 2);
    const dist = opts.dist ?? rand(8, 32);
    el.className = 'spark';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--s', size.toFixed(1) + 'px');
    el.style.setProperty('--c', pick(opts.colors ?? GOLDS));
    el.style.setProperty('--dx', (Math.cos(angle) * dist).toFixed(1) + 'px');
    el.style.setProperty('--dy', (Math.sin(angle) * dist + (opts.fall ?? 16)).toFixed(1) + 'px');
    el.style.setProperty('--rot', rand(-200, 200).toFixed(0) + 'deg');
    el.style.setProperty('--life', (opts.life ?? rand(650, 1050)).toFixed(0) + 'ms');
    live++;
    el.addEventListener('animationend', () => { el.remove(); live--; }, { once: true });
    layer.appendChild(el);
  }

  // A gentle golden trail behind the mouse
  if (finePointer) {
    let lastX = -999, lastY = -999, lastT = 0;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const now = performance.now();
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (now - lastT < 40 || dx * dx + dy * dy < 196) return;
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      spark(e.clientX + rand(-6, 6), e.clientY + rand(-6, 6));
    }, { passive: true });
  }

  // A happy burst wherever you click or tap
  window.addEventListener('pointerdown', (e) => {
    const n = 12;
    for (let k = 0; k < n; k++) {
      spark(e.clientX, e.clientY, {
        angle: (Math.PI * 2 * k) / n + rand(-0.25, 0.25),
        dist: rand(38, 86),
        size: rand(8, 15),
        fall: 10,
        life: rand(700, 1100),
        colors: BURST,
      });
    }
  });

  if (!finePointer) return;

  // Sparkles that pop off the edges of buttons and the logo on hover
  document.querySelectorAll('.btn-primary, .btn-dark, .btn-light, [data-sparkle]').forEach((el) => {
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const n = parseInt(el.dataset.sparkle, 10) || 7;
      for (let k = 0; k < n; k++) {
        const top = Math.random() < 0.5;
        spark(rand(r.left + 6, r.right - 6), top ? r.top : r.bottom, {
          angle: top ? rand(-Math.PI * 0.85, -Math.PI * 0.15) : rand(Math.PI * 0.15, Math.PI * 0.85),
          dist: rand(14, 34),
          fall: 0,
          size: rand(6, 12),
        });
      }
    });
  });

  // Service cards tilt toward the cursor, with a golden spotlight
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      card.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
      card.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  // Main buttons lean gently toward the cursor
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px');
      btn.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--bx', '0px');
      btn.style.setProperty('--by', '0px');
    });
  });

  // Hero art drifts softly with the mouse
  const hero = document.querySelector('.hero');
  const art = document.querySelector('.hero-art');
  if (hero && art) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      art.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      art.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    });
    hero.addEventListener('pointerleave', () => {
      art.style.setProperty('--px', '0');
      art.style.setProperty('--py', '0');
    });
  }
})();
