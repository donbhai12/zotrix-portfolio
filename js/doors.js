/* Zotrix — "Open a door, see real work".
   Each door opens onto a service with the live projects behind it.
   Visiting all four doors unlocks a fifth: the Secret Lab. */
(() => {
  'use strict';

  const Z = (window.Z = window.Z || {});
  const IG_URL = 'https://www.instagram.com/zotrixtechmedia/';

  const PROJECTS = {
    parantha: { name: 'The Parantha Street', meta: 'Restaurant · Sunnyvale, CA', host: 'theparanthastreet.com', url: 'https://theparanthastreet.com/', img: 'assets/work/parantha.jpg', w: 800, h: 455 },
    biryani: { name: 'The Biryani Street', meta: 'Restaurant · Sunnyvale, CA', host: 'thebiryanistreetusa.com', url: 'https://thebiryanistreetusa.com/', img: 'assets/work/biryani.jpg', w: 800, h: 500 },
    cric: { name: 'Cric Headline', meta: 'Hindi cricket news portal', host: 'cricheadline.com', url: 'https://cricheadline.com/', img: 'assets/work/cricheadline.jpg', w: 800, h: 505 },
    zr: { name: 'Zotrix Research', meta: 'Construction · Railways · GIS', host: 'zotrixresearch.com', url: 'https://www.zotrixresearch.com/', img: 'assets/work/zotrixresearch.jpg', w: 800, h: 500 },
  };

  const REELS = [
    { img: 'assets/work/reel-diwali.jpg', label: 'Reel: the Diwali commission maths for restaurants' },
    { img: 'assets/work/reel-khana.jpg', label: 'Reel: Khana best hai' },
    { img: 'assets/work/reel-competitor.jpg', label: 'Reel: Aapka sabse bada competitor?' },
  ];

  const CAPS = [
    { icon: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12Z', title: 'WhatsApp bots', text: 'Auto-replies, order alerts & lead capture' },
    { icon: 'M12 8V4M8 4h8M5 8h14v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM9 13h.01M15 13h.01M9 17h6', title: 'AI assistants', text: 'Answer website enquiries day and night' },
    { icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2', title: 'Dashboards', text: 'Track orders, sites, teams or sales' },
    { icon: 'M13 2 4 14h7l-1 8 9-12h-7z', title: 'Automations', text: 'Hours of manual work, handled' },
  ];

  const DOORS = {
    web: {
      n: '01', title: 'Restaurant Websites', tag: 'The Parantha Street · The Biryani Street', color: '#3D7BFF',
      lead: 'Websites that make people hungry — and let them order direct from you, without third-party markups.',
      points: ['Direct online ordering for pickup — no third-party markup', 'Order tracking, offers & combos built in', 'Mouth-watering menus that are easy to update', 'Mobile-first, fast and SEO-ready'],
      cta: 'Start my restaurant site', need: 'Restaurant website', work: ['parantha', 'biryani'],
    },
    media: {
      n: '02', title: 'News Portals', tag: 'Cric Headline', color: '#38A8FF',
      lead: 'A Hindi-first cricket newsroom built for daily readers — and for Google.',
      points: ['Latest-news ticker, sections & match analysis', 'Hindi-first articles structured for SEO', 'Instagram & WhatsApp follow built in', 'Clean, readable layout on every phone'],
      cta: 'Start my news portal', need: 'News portal', work: ['cric'],
    },
    biz: {
      n: '03', title: 'Business Websites', tag: 'Zotrix Research', color: '#8E9BB5',
      lead: 'A corporate site that wins trust — plus the tools that run the business behind it.',
      points: ['Service pages for nine specialised business lines', 'Government & private tender showcase', 'Client login & project-tracking platform', 'AI assistant that answers enquiries', 'Search Console, Analytics & Bing set up'],
      cta: 'Start my business site', need: 'Business website', work: ['zr'],
    },
    reels: {
      n: '04', title: 'Reels & Branding', tag: '@zotrixtechmedia', color: '#6F8BFF',
      lead: 'Scroll-stopping reels with a desi touch that turn viewers into DMs.',
      points: ['Hook-first scripts in Hinglish & English', 'Edits with captions, sound design & motion text', 'Covers, posts, thumbnails & brand creatives', 'Comment-to-DM automation for leads'],
      cta: 'Start my reels', need: 'Reels & branding', work: 'reels',
    },
    secret: {
      n: '05', title: 'The Secret Lab', tag: 'Custom builds', color: '#3D7BFF',
      lead: 'Psst — you found the lab. For businesses that want something made just for them.',
      points: ['Built around how your team actually works', 'Connects with the tools you already use', 'Starts small and grows with your business', 'Tell us the problem — we’ll sketch the fix'],
      cta: 'Tell us your idea', need: 'Something custom', work: 'caps',
    },
  };
  const MAIN_DOORS = ['web', 'media', 'biz', 'reels'];

  /* ---------- builders ---------- */
  const { el } = Z;

  function iconSvg(d) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
    return svg;
  }

  function siteCard(p) {
    const bar = el('span', { class: 'wcard__bar', 'aria-hidden': 'true' }, [el('i'), el('i'), el('i'), el('em', { text: p.host })]);
    const img = el('img', { src: p.img, alt: `${p.name} website homepage`, width: String(p.w), height: String(p.h), loading: 'lazy', decoding: 'async' });
    const meta = el('span', { class: 'wcard__meta' }, [
      el('b', { text: p.name }), el('small', { text: p.meta }), el('span', { class: 'wcard__go', text: 'Visit live ↗' }),
    ]);
    return el('a', { class: 'wcard', href: p.url, target: '_blank', rel: 'noopener' }, [bar, img, meta]);
  }

  function reelsBlock() {
    const links = REELS.map((r) => el('a', { href: IG_URL, target: '_blank', rel: 'noopener', 'aria-label': `${r.label} — watch on Instagram` }, [
      el('img', { src: r.img, alt: '', width: '432', height: '768', loading: 'lazy', decoding: 'async' }),
    ]));
    return el('div', { class: 'reels' }, [
      el('div', { class: 'reels__stack' }, links),
      el('a', { class: 'reels__cta', href: IG_URL, target: '_blank', rel: 'noopener', text: 'Watch our reels on Instagram ↗' }),
    ]);
  }

  function capsBlock() {
    return el('ul', { class: 'caps' }, CAPS.map((c) => el('li', {}, [iconSvg(c.icon), el('b', { text: c.title }), el('small', { text: c.text })])));
  }

  function workFor(door) {
    if (door.work === 'reels') return reelsBlock();
    if (door.work === 'caps') return capsBlock();
    const frag = document.createDocumentFragment();
    door.work.forEach((id) => frag.appendChild(siteCard(PROJECTS[id])));
    return frag;
  }

  function renderInfo(ui, key) {
    const d = DOORS[key];
    ui.n.textContent = `${d.n} / ${key === 'secret' ? '05' : '04'}`;
    ui.h.textContent = d.title;
    ui.t.textContent = d.tag;
    ui.lead.textContent = d.lead;
    ui.list.replaceChildren(...d.points.map((p) => el('li', { text: p })));
    ui.ctaTxt.textContent = d.cta;
    ui.cta.dataset.need = d.need;
    ui.root.style.setProperty('--door-c', d.color);
    ui.work.replaceChildren(workFor(d));
    Z.restart(ui.root, 'is-swap');
  }

  /* ---------- custom "Open door" cursor (mouse only) ---------- */
  function initCursor(row) {
    const cursor = Z.byId('doorCursor');
    if (!cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.documentElement.classList.add('has-door-cursor');
    const label = cursor.querySelector('span');
    let x = -200;
    let y = -200;
    let rafId = 0;
    const paint = () => { rafId = 0; cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`; };
    row.addEventListener('pointermove', (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!rafId) rafId = requestAnimationFrame(paint);
      const unit = e.target.closest('.unit');
      if (!unit) { cursor.classList.remove('is-on'); return; }
      label.textContent = unit.classList.contains('is-open') ? 'You’re in ✦' : 'Open door';
      cursor.classList.add('is-on');
    });
    row.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));
  }

  /* ---------- doors ---------- */
  function initDoors() {
    const row = Z.byId('doorsRow');
    const info = Z.byId('dinfo');
    if (!row || !info) return;
    const ui = {
      root: info, n: Z.byId('dinfoN'), h: Z.byId('dinfoH'), t: Z.byId('dinfoT'), lead: Z.byId('dinfoLead'),
      list: Z.byId('dinfoList'), cta: Z.byId('dinfoCta'), ctaTxt: Z.byId('dinfoCtaTxt'), work: Z.byId('dinfoWork'),
    };
    const dots = Z.byId('doorsDots');
    const visited = new Set();
    let current = null;
    let rendered = 'web'; // the HTML already ships with the first door's content

    const visibleUnits = () => [...row.querySelectorAll('.unit:not([hidden])')];

    function syncDots() {
      if (!dots) return;
      const list = visibleUnits();
      if (dots.children.length !== list.length) dots.replaceChildren(...list.map(() => el('i')));
      const idx = list.findIndex((u) => u.dataset.door === current);
      [...dots.children].forEach((dot, i) => dot.classList.toggle('on', i === idx));
    }

    function centerUnit(unit) {
      if (row.scrollWidth <= row.clientWidth) return;
      const left = unit.offsetLeft - (row.clientWidth - unit.offsetWidth) / 2;
      row.scrollTo({ left, behavior: Z.reduced ? 'auto' : 'smooth' });
    }

    function revealSecret() {
      const secret = row.querySelector('.unit--secret');
      if (!secret || !secret.hidden || !MAIN_DOORS.every((k) => visited.has(k))) return;
      secret.hidden = false;
      secret.classList.add('is-arrive');
      syncDots();
      Z.toast('Psst… you unlocked the Secret Lab ✦');
    }

    function open(key, opts = {}) {
      const unit = row.querySelector(`.unit[data-door="${key}"]`);
      if (!DOORS[key] || !unit || unit.hidden) return;
      row.querySelectorAll('.unit').forEach((u) => {
        const on = u === unit;
        u.classList.toggle('is-open', on);
        u.querySelector('.door').setAttribute('aria-expanded', String(on));
      });
      current = key;
      if (key !== rendered) { renderInfo(ui, key); rendered = key; }
      visited.add(key);
      syncDots();
      if (opts.center) centerUnit(unit);
      revealSecret();
      Z.emit('door', key);
    }

    row.addEventListener('click', (e) => {
      const btn = e.target.closest('.door');
      if (btn) open(btn.closest('.unit').dataset.door, { center: true });
    });

    row.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const list = visibleUnits();
      const i = list.findIndex((u) => u.contains(document.activeElement));
      if (i < 0) return;
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      list[(i + step + list.length) % list.length].querySelector('.door').focus();
    });

    // Phones: swiping the wall opens whichever door lands in the middle.
    let settle = 0;
    row.addEventListener('scroll', () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const mid = row.scrollLeft + row.clientWidth / 2;
        const best = visibleUnits().reduce((acc, u) => {
          const dist = Math.abs(u.offsetLeft + u.offsetWidth / 2 - mid);
          return dist < acc.dist ? { u, dist } : acc;
        }, { u: null, dist: Infinity }).u;
        if (best && best.dataset.door !== current) open(best.dataset.door);
      }, 140);
    }, { passive: true });

    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-door-link]');
      if (link) open(link.dataset.doorLink, { center: true });
    });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((en) => en.isIntersecting)) return;
        if (!current) open('web');
        io.disconnect();
      }, { threshold: 0.35 });
      io.observe(row);
    }

    initCursor(row);
    Z.openDoor = open;
    Z.currentDoor = () => current;
  }

  Z.initDoors = initDoors;
})();
