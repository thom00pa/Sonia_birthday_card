'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ── iOS HARD FAILSAFE ─────────────────────────────────────────
  // If anything in the boot sequence throws an error on iOS,
  // this forces the app visible after 4 seconds.
  const bootFailsafe = setTimeout(() => {
    try {
      const ls = document.getElementById('loading-screen');
      if (ls) { ls.style.opacity = '0'; ls.style.pointerEvents = 'none'; }
      const first = document.querySelector('.chapter[data-chapter="0"]');
      if (first) {
        first.style.cssText += '; opacity:1; transform:scale(1); pointer-events:auto;';
      }
      // Build dots if they weren't built yet
      const dots = document.getElementById('progress-dots');
      if (dots && !dots.hasChildNodes()) {
        const count = document.querySelectorAll('.chapter').length;
        buildDots(count);
        updateDots(0);
      }
    } catch(e) {}
  }, 4000);

  // ── SAFETY CHECK ──────────────────────────────────────────────
  if (typeof window.CONFIG === 'undefined') {
    document.body.innerHTML = '';
    const err = document.createElement('div');
    err.style.cssText = 'padding:40px;text-align:center;font-family:serif;color:#C9624F;font-size:1.1rem;';
    err.textContent = '⚠️ config.js no encontrado. Por favor verifica que esté cargado correctamente.';
    document.body.appendChild(err);
    clearTimeout(bootFailsafe);
    return;
  }

  try {

    // ── iOS VIEWPORT HEIGHT FIX ───────────────────────────────
    // dvh units not supported on iOS < 15.4. Set a CSS variable instead.
    function setVH() {
      document.documentElement.style.setProperty(
        '--vh', (window.innerHeight * 0.01) + 'px'
      );
    }
    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 200);
    });

    // ── THEME ─────────────────────────────────────────────────
    try {
      const t = CONFIG.theme || {};
      const r = document.documentElement.style;
      if (t.primary)    r.setProperty('--color-primary',    t.primary);
      if (t.secondary)  r.setProperty('--color-secondary',  t.secondary);
      if (t.background) r.setProperty('--color-background', t.background);
      if (t.text)       r.setProperty('--color-text',       t.text);
      if (t.accent)     r.setProperty('--color-accent',     t.accent);
      if (t.highlight)  r.setProperty('--color-highlight',  t.highlight);
    } catch(e) {}

    // ── AUTHOR SIGNATURE ──────────────────────────────────────
    try {
      const _sig = Object.freeze({
        author:  CONFIG.author ? CONFIG.author.name  : '',
        contact: CONFIG.author ? CONFIG.author.email : '',
        built:   new Date().toISOString()
      });
      console.log(
        '%c✦ Made with love by ' + _sig.author + ' ✦',
        'color:#D4845A;font-size:13px;font-style:italic;'
      );
      const m = document.createElement('meta');
      m.name = 'author';
      m.content = _sig.author;
      document.head.appendChild(m);
    } catch(e) {}

    // ── CHAPTER NAVIGATION ────────────────────────────────────
    let currentChapter = -1;
    let totalChapters  = 0;
    let isAnimating    = false;

    function goToChapter(index) {
      try {
        if (isAnimating) return;
        if (index < 0 || index >= totalChapters) return;

        isAnimating = true;
        const chapters = document.querySelectorAll('.chapter');
        const outgoing = chapters[currentChapter];
        const incoming = chapters[index];
        if (!incoming) { isAnimating = false; return; }

        if (outgoing) {
          outgoing.classList.remove('is-active');
          outgoing.classList.add('is-exiting');
          setTimeout(() => { outgoing.classList.remove('is-exiting'); }, 650);
        }

        incoming.classList.add('is-active');
        currentChapter = index;

        // Apply body class based on chapter ID
        const classesToRemove = [];
        document.body.classList.forEach(cls => {
          if (cls.startsWith('chapter-') && cls.endsWith('-active'))
            classesToRemove.push(cls);
        });
        classesToRemove.forEach(cls => document.body.classList.remove(cls));
        const chapId = incoming.id || ('chapter-' + (index + 1));
        document.body.classList.add(chapId + '-active');

        updateDots(index);
        updateArrows(index);
        updateBottomNav(index);

        try { Animations.animateChapterEnter(index); } catch(e) {}

        setTimeout(() => { isAnimating = false; }, 700);
      } catch(e) { isAnimating = false; }
    }

    function next() { goToChapter(currentChapter + 1); }
    function prev() { goToChapter(currentChapter - 1); }

    window.App = { goToChapter, next, prev };

    // ── PROGRESS DOTS ─────────────────────────────────────────
    function buildDots(count) {
      try {
        const nav = document.getElementById('progress-dots');
        if (!nav) return;
        nav.innerHTML = '';
        for (let i = 0; i < count; i++) {
          const dot = document.createElement('button');
          dot.className = 'progress-dot';
          dot.setAttribute('aria-label', 'Capítulo ' + (i + 1));
          dot.addEventListener('click', () => goToChapter(i));
          nav.appendChild(dot);
        }
      } catch(e) {}
    }

    function updateDots(i) {
      try {
        document.querySelectorAll('.progress-dot').forEach((d, j) => {
          d.classList.toggle('is-active', j === i);
        });
      } catch(e) {}
    }

    // ── ARROWS ────────────────────────────────────────────────
    function updateArrows(i) {
      try {
        const L = document.getElementById('nav-arrow-left');
        const R = document.getElementById('nav-arrow-right');
        if (L) L.disabled = (i === 0);
        if (R) R.disabled = (i === totalChapters - 1);
      } catch(e) {}
    }

    // ── BOTTOM NAV BAR ────────────────────────────────────────
    function updateBottomNav(i) {
      try {
        const lbl  = document.getElementById('nav-btn-label');
        const prev = document.getElementById('nav-btn-prev');
        const next = document.getElementById('nav-btn-next');
        if (lbl)  lbl.textContent = (i + 1) + ' / ' + totalChapters;
        if (prev) prev.disabled   = (i === 0);
        if (next) next.disabled   = (i === totalChapters - 1);
      } catch(e) {}
    }

    // ── TOUCH/SWIPE ────────────────────────────────────────────
    let touchStartX = 0, touchStartY = 0, touchStartScroll = 0;
    document.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      const active = document.querySelector('.chapter.is-active');
      touchStartScroll = active ? active.scrollTop : 0;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      try {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const active = document.querySelector('.chapter.is-active');
        const scrolled = Math.abs((active ? active.scrollTop : 0) - touchStartScroll);
        if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5 && scrolled < 15) {
          if (dx < 0) next(); else prev();
        }
      } catch(e) {}
    }, { passive: true });

    // ── KEYBOARD ──────────────────────────────────────────────
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  next();
      if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    prev();
    });

    // ── LANGUAGE TOGGLE ───────────────────────────────────────
    const btnLang = document.getElementById('btn-lang');
    if (btnLang) {
      btnLang.addEventListener('click', () => {
        try {
          if (Animations.resetTypewriter) Animations.resetTypewriter();
          I18n.toggle();
          const bL2 = document.getElementById('btn-lang');
          if (bL2) bL2.textContent = I18n.currentLang === 'es' ? 'EN' : 'ES';
          const c = document.getElementById('chapter-container');
          if (c) {
            c.classList.add('lang-transition');
            setTimeout(() => c.classList.remove('lang-transition'), 400);
          }
        } catch(e) {}
      });
    }

    // ── NAV ZONES ─────────────────────────────────────────────
    const zL = document.getElementById('nav-zone-left');
    const zR = document.getElementById('nav-zone-right');
    if (zL) zL.addEventListener('click', prev);
    if (zR) zR.addEventListener('click', next);

    // ── DESKTOP ARROWS ────────────────────────────────────────
    const aL = document.getElementById('nav-arrow-left');
    const aR = document.getElementById('nav-arrow-right');
    if (aL) aL.addEventListener('click', prev);
    if (aR) aR.addEventListener('click', next);

    // ── BOTTOM NAV BUTTONS ────────────────────────────────────
    const bP = document.getElementById('nav-btn-prev');
    const bN = document.getElementById('nav-btn-next');
    if (bP) bP.addEventListener('click', prev);
    if (bN) bN.addEventListener('click', next);

    // ── INIT SEQUENCE ─────────────────────────────────────────
    try { Animations.init(); } catch(e) {}

    // Build chapters — each wrapped in try-catch so one failure
    // doesn't prevent the rest from building
    try { Sections.build(); } catch(e) {}

    totalChapters = document.querySelectorAll('#chapter-container .chapter').length;
    buildDots(totalChapters);
    updateBottomNav(0);
    updateArrows(0);

    // Initial button labels
    try {
      const bL = document.getElementById('btn-lang');
      if (bL) bL.textContent = I18n.currentLang === 'es' ? 'EN' : 'ES';
      const bN2 = document.getElementById('nav-btn-label');
      if (bN2) bN2.textContent = '1 / ' + totalChapters;
    } catch(e) {}

    // ── PLAY OPENING ──────────────────────────────────────────
    Animations.playOpeningSequence(() => {
      clearTimeout(bootFailsafe); // Cancel failsafe — boot succeeded
      goToChapter(0);
      try { Animations.startParticles(); } catch(e) {}
    });

  } catch(globalError) {
    // Last resort: if everything fails, force show the app
    clearTimeout(bootFailsafe);
    const ls = document.getElementById('loading-screen');
    if (ls) ls.style.display = 'none';
    const first = document.querySelector('.chapter');
    if (first) {
      first.style.cssText += '; opacity:1; transform:none; pointer-events:auto;';
    }
  }

});
