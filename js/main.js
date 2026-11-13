/* Zotrix — page boot: loader, clock, flip card, live-project phone,
   scroll reveal, nav highlight, mobile menu, back-to-top, magnetic buttons. */
(() => {
  'use strict';

  const Z = window.Z;
  if (!Z) return;
  document.documentElement.classList.add('z-ok'); // cancels the CSS failsafes

  const { byId } = Z;
  const FLIP_EVERY_MS = 2800;
  const FLIP_ANIM_MS = 820;
  const SLIDE_EVERY_MS = 4200;
  const TOTOP_AFTER_PX = 480;

  const SLIDES = [
    { url: 'https://theparanthastreet.com/', name: 'The Parantha Street', place: 'Sunnyvale, CA', country: 'United States', tag: 'Order direct', tagSub: 'No third-party markup' },
    { url: 'https://thebiryanistreetusa.com/', name: 'The Biryani Street', place: 'Sunnyvale, CA', country: 'United States', tag: 'Online ordering', tagSub: 'With live order tracking' },
    { url: 'https://cricheadline.com/', name: 'Cric Headline', place: 'Cricket news', country: 'Hindi · India', tag: 'News portal', tagSub: 'Built for Google search' },
  ];
  const DOOR_TO_NAV = { web: 'web', media: 'biz', biz: 'biz', reels: 'reels', secret: 'web' };

  /* ---------- intro loader ---------- */
  function runLoader(onDone) {
    const loader = byId('loader');
    const pct = byId('loaderPct');
    const bar = byId('loaderBar');
    if (!loader || !pct || !bar) { onDone(); return; }
    let seen = false;
    try {
      seen = sessionStorage.getItem('zotrix-seen') === '1';
      sessionStorage.setItem('zotrix-seen', '1');
    } catch (err) { seen = false; }
    const minMs = Z.reduced ? 150 : (seen ? 500 : 1700);
    const start = performance.now();
    let fontsReady = false;
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    fonts.then(() => { fontsReady = true; }, () => { fontsReady = true; });
    window.setTimeout(() => { fontsReady = true; }, 3000);
    document.body.style.overflow = 'hidden';

    function finish() {
      loader.classList.add('is-done');
      document.documentElement.classList.add('is-loaded');
      document.body.style.overflow = '';
      window.setTimeout(() => { loader.hidden = true; }, 1100);
      onDone();
    }
    function tick(now) {
      const linear = Math.min(1, (now - start) / minMs);
      const eased = 1 - (1 - linear) ** 3;
      const p = fontsReady ? eased : Math.min(eased, 0.9);
      pct.textContent = String(Math.round(p * 100));
      bar.style.transform = `scaleX(${p.toFixed(3)})`;
      if (p >= 1) finish();
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function revealHero() {
    document.querySelectorAll('.hero .rv').forEach((node, i) => {
      node.style.setProperty('--d', `${(i * 0.09).toFixed(2)}s`);
      node.classList.add('in');
    });
  }

  function initReveal() {
    const nodes = [...document.querySelectorAll('.rv')].filter((n) => !n.closest('.hero'));
    if (!('IntersectionObserver' in window)) { nodes.forEach((n) => n.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    nodes.forEach((n) => io.observe(n));
  }

  /* ---------- Mohali clock ---------- */
  function initClock() {
    const timeEl = byId('clockTime');
    const dateEl = byId('clockDate');
    if (!timeEl) return;
    const tz = 'Asia/Kolkata';
    const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true });
    const dateFmt = new Intl.DateTimeFormat('en-GB', { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' });
    const update = () => {
      const now = new Date();
      timeEl.textContent = timeFmt.format(now).replace(/\s/g, '').toLowerCase();
      if (!dateEl) return;
      const parts = Object.fromEntries(dateFmt.formatToParts(now).map((p) => [p.type, p.value]));
      dateEl.textContent = `${parts.day} ${parts.month}, ${parts.year}`;
    };
    update();
    window.setInterval(update, 15000);
  }

  /* ---------- spiral flip card ---------- */
  function initFlip() {
    const pages = [...document.querySelectorAll('.flip__page')];
    const counter = byId('flipNow');
    if (pages.length < 2 || Z.reduced) return;
    let i = 0;
    window.setInterval(() => {
      if (document.hidden) return;
      const cur = pages[i];
      const nextIndex = (i + 1) % pages.length;
      const next = pages[nextIndex];
      next.classList.add('is-next');
      cur.classList.add('is-out');
      window.setTimeout(() => {
        cur.classList.remove('is-out', 'is-cur');
        next.classList.remove('is-next');
        next.classList.add('is-cur');
      }, FLIP_ANIM_MS);
      i = nextIndex;
      if (counter) counter.textContent = String(i + 1).padStart(2, '0');
    }, FLIP_EVERY_MS);
  }

  /* ---------- phone cycling through live projects ---------- */
  function initDevice() {
    const link = byId('deviceLink');
    if (!link) return;
    const imgs = [...link.querySelectorAll('img')];
    const fields = ['name', 'place', 'country', 'tag', 'tagSub'].map((k) => [k, byId(`slide${k[0].toUpperCase()}${k.slice(1)}`)]);
    const floats = [...document.querySelectorAll('.device .float')];
    if (imgs.length < 2 || Z.reduced) return;
    let i = 0;
    const show = (n) => {
      const s = SLIDES[n];
      imgs.forEach((img, k) => img.classList.toggle('is-on', k === n));
      fields.forEach(([key, node]) => { if (node) node.textContent = s[key]; });
      link.href = s.url;
      link.setAttribute('aria-label', `Open the ${s.name} website, built by Zotrix`);
      floats.forEach((f) => Z.restart(f, 'is-swap'));
    };
    window.setInterval(() => {
      if (document.hidden) return;
      i = (i + 1) % Math.min(imgs.length, SLIDES.length);
      show(i);
    }, SLIDE_EVERY_MS);
  }

  /* ---------- nav highlight ---------- */
  function initSpy() {
    const links = [...document.querySelectorAll('.nav a[data-spy]')];
    if (!links.length || !('IntersectionObserver' in window)) return;
    let section = 'home';
    const setActive = (key) => links.forEach((a) => a.classList.toggle('is-active', a.dataset.spy === key));
    const refresh = () => {
      if (section !== 'work') { setActive(section); return; }
      const door = Z.currentDoor ? Z.currentDoor() : null;
      setActive(DOOR_TO_NAV[door] || 'web');
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { section = en.target.id; refresh(); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'work', 'process', 'contact'].forEach((id) => { const s = byId(id); if (s) io.observe(s); });
    Z.on('door', refresh);
  }

  /* ---------- mobile menu ---------- */
  function initMenu() {
    const btn = byId('menuBtn');
    const sheet = byId('mnav');
    if (!btn || !sheet) return;
    let hideTimer = 0;
    const isOpen = () => btn.getAttribute('aria-expanded') === 'true';
    // While the menu is open, the page behind it is inert so Tab stays in the menu + header.
    const behind = ['main', 'contact', 'cord', 'totop'].map(byId).filter(Boolean);
    const set = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      window.clearTimeout(hideTimer);
      document.body.style.overflow = open ? 'hidden' : '';
      behind.forEach((node) => { node.inert = open; });
      if (open) {
        sheet.hidden = false;
        void sheet.offsetWidth; // let the closed state paint so the fade runs
        sheet.classList.add('is-open');
        const first = sheet.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else {
        sheet.classList.remove('is-open');
        hideTimer = window.setTimeout(() => { sheet.hidden = true; }, 420);
      }
    };
    btn.addEventListener('click', () => set(!isOpen()));
    sheet.addEventListener('click', (e) => { if (e.target.closest('a, button')) set(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { set(false); btn.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 980 && isOpen()) set(false); });
  }

  /* ---------- back to top + progress ring ---------- */
  function initToTop() {
    const toTop = () => window.scrollTo({ top: 0, behavior: Z.reduced ? 'auto' : 'smooth' });
    document.querySelectorAll('[data-totop]').forEach((b) => b.addEventListener('click', toTop));
    const btn = byId('totop');
    const ring = btn && btn.querySelector('circle');
    if (!btn || !ring) return;
    btn.addEventListener('click', toTop);
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      ring.style.strokeDashoffset = String(100 - p * 100);
      btn.classList.toggle('is-on', window.scrollY > TOTOP_AFTER_PX);
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ---------- magnetic buttons (mouse only) ---------- */
  function initMagnetic() {
    if (Z.reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('.magnetic').forEach((node) => {
      node.addEventListener('pointermove', (e) => {
        const r = node.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.16;
        const y = (e.clientY - r.top - r.height / 2) * 0.3;
        node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      node.addEventListener('pointerleave', () => { node.style.transform = ''; });
    });
  }

  function safely(fn) {
    try {
      fn();
    } catch (err) {
      // One broken widget must not take the whole page down with it.
      console.error('[zotrix] init failed:', fn && fn.name, err);
    }
  }

  function boot() {
    const year = byId('year');
    if (year) year.textContent = String(new Date().getFullYear());
    [Z.initCord, Z.initDoors, Z.initStory, Z.initContact]
      .filter((fn) => typeof fn === 'function')
      .forEach(safely);
    [initClock, initFlip, initDevice, initReveal, initSpy, initMenu, initToTop, initMagnetic].forEach(safely);
    runLoader(() => {
      revealHero();
      if (Z.showCordHint) window.setTimeout(Z.showCordHint, 1600);
    });
  }

  boot();
})();
