/* Zotrix — hanging light-switch cord.
   A small verlet rope; pull (or click / press Enter on) the bead to flip the theme.
   The physics loop mutates its own point array on purpose — it runs every frame
   while the rope moves and goes to sleep as soon as it settles. */
(() => {
  'use strict';

  const Z = (window.Z = window.Z || {});

  const SEGMENTS = 12;
  const GRAVITY = 0.55;
  const DAMPING = 0.986;
  const ITERATIONS = 8;
  const PULL_TRIGGER = 42; // px past the rest length that flips the lights
  const MAX_STRETCH = 1.45; // the rope may stretch to this × its rest length
  const STEP_MS = 1000 / 60;
  const SLEEP_EPSILON = 0.02;
  const NUDGE_EVERY_MS = 7000;
  const MAX_NUDGES = 4;
  const THEME_KEY = 'zotrix-theme';
  const USED_KEY = 'zotrix-cord-used';
  const THEME_COLORS = { dark: '#06070B', light: '#F3F5F9' };

  // On phones the bead sits just under the header so it never covers the headline.
  const restLength = () => (window.innerWidth <= 980 ? 74 : 160);
  const HINT_VISIBLE_MS = 9000;
  const currentTheme = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  function makeRope(anchor, length) {
    const seg = length / SEGMENTS;
    const pts = Array.from({ length: SEGMENTS + 1 }, (_, i) => {
      const y = anchor.y + i * seg;
      return { x: anchor.x, y, px: anchor.x, py: y };
    });
    return { pts, seg, length, stretch: 1, stretchV: 0 };
  }

  function integrate(rope, dragging) {
    for (let i = 1; i < rope.pts.length; i += 1) {
      const p = rope.pts[i];
      const vx = (p.x - p.px) * DAMPING;
      const vy = (p.y - p.py) * DAMPING;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + GRAVITY;
    }
    if (!dragging) {
      rope.stretchV = (rope.stretchV + (1 - rope.stretch) * 0.16) * 0.74;
      rope.stretch += rope.stretchV;
    }
  }

  function constrain(rope, anchor, target) {
    const { pts } = rope;
    const last = pts.length - 1;
    const seg = rope.seg * rope.stretch;
    for (let k = 0; k < ITERATIONS; k += 1) {
      pts[0].x = anchor.x;
      pts[0].y = anchor.y;
      if (target) { pts[last].x = target.x; pts[last].y = target.y; }
      for (let i = 0; i < last; i += 1) {
        const a = pts[i];
        const b = pts[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const diff = (dist - seg) / dist;
        const aPinned = i === 0;
        const bPinned = Boolean(target) && i + 1 === last;
        if (aPinned && bPinned) continue;
        const wa = aPinned ? 0 : (bPinned ? 1 : 0.5);
        const wb = bPinned ? 0 : (aPinned ? 1 : 0.5);
        a.x += dx * diff * wa; a.y += dy * diff * wa;
        b.x -= dx * diff * wb; b.y -= dy * diff * wb;
      }
    }
    if (target) { pts[last].px = pts[last].x; pts[last].py = pts[last].y; }
  }

  function energy(rope) {
    return rope.pts.reduce((sum, p) => sum + Math.abs(p.x - p.px) + Math.abs(p.y - p.py),
      Math.abs(rope.stretchV) + Math.abs(rope.stretch - 1));
  }

  function pathFor(pts) {
    const f = (n) => n.toFixed(1);
    let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
    for (let i = 1; i < pts.length - 1; i += 1) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      d += ` Q${f(pts[i].x)} ${f(pts[i].y)} ${f(mx)} ${f(my)}`;
    }
    const end = pts[pts.length - 1];
    return `${d} L${f(end.x)} ${f(end.y)}`;
  }

  /* ---------- theme ---------- */
  function syncThemeUi(theme, bead) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', THEME_COLORS[theme]);
    bead.setAttribute('aria-pressed', String(theme === 'light'));
    bead.setAttribute('aria-label', theme === 'light'
      ? 'Pull the cord to turn the lights off'
      : 'Pull the cord to turn the lights on');
  }

  function applyTheme(theme, bead) {
    document.documentElement.setAttribute('data-theme', theme);
    syncThemeUi(theme, bead);
    try { localStorage.setItem(THEME_KEY, theme); } catch (err) {
      // Storage blocked (private mode) — the theme still applies for this visit.
    }
  }

  let audio = null;
  function playClick() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      audio = audio || new Ctx();
      const t = audio.currentTime;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1900, t);
      osc.frequency.exponentialRampToValueAtTime(520, t + 0.05);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.09, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      osc.connect(gain).connect(audio.destination);
      osc.start(t);
      osc.stop(t + 0.09);
    } catch (err) {
      // Audio is optional garnish; if the browser refuses it the switch still works.
    }
  }

  function toggleTheme(bead) {
    // Decide the next theme when the swap actually runs, so two quick pulls
    // (whose view transitions may queue up) still flip twice instead of once.
    const run = () => {
      const next = currentTheme() === 'light' ? 'dark' : 'light';
      applyTheme(next, bead);
      if (Z.emit) Z.emit('theme', next);
    };
    playClick();
    if (!document.startViewTransition || Z.reduced) {
      const html = document.documentElement;
      html.classList.add('theme-anim');
      run();
      window.setTimeout(() => html.classList.remove('theme-anim'), 650);
    } else {
      const r = bead.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      const vt = document.startViewTransition(run);
      vt.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 800, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' },
        );
      }).catch(() => {
        // Transition skipped (tab hidden, etc.) — the new theme is already applied.
      });
    }
  }

  /* ---------- the cord itself ---------- */
  function initCord() {
    const root = Z.byId('cord');
    const bead = Z.byId('cordBead');
    const hint = Z.byId('cordHint');
    const ropeEls = [Z.byId('cordRopeO'), Z.byId('cordRope')].filter(Boolean);
    if (!root || !bead) return;

    let anchor = { x: root.clientWidth / 2, y: -10 };
    let rope = makeRope(anchor, restLength());
    let target = null;
    let drag = null;
    let raf = 0;
    let lastT = 0;
    let acc = 0;
    let nudges = 0;
    let used = false;
    let skipNextClick = false;
    try { used = localStorage.getItem(USED_KEY) === '1'; } catch (err) { used = false; }

    syncThemeUi(currentTheme(), bead);

    function render() {
      const { pts } = rope;
      const d = pathFor(pts);
      ropeEls.forEach((el) => el.setAttribute('d', d));
      const end = pts[pts.length - 1];
      const prev = pts[pts.length - 2];
      const angle = (Math.atan2(end.x - prev.x, end.y - prev.y) * -180) / Math.PI;
      bead.style.transform = `translate(${end.x.toFixed(1)}px, ${end.y.toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`;
    }

    function frame(t) {
      if (!lastT) lastT = t;
      acc += Math.min(t - lastT, 100);
      lastT = t;
      while (acc >= STEP_MS) {
        integrate(rope, Boolean(drag));
        constrain(rope, anchor, drag ? target : null);
        acc -= STEP_MS;
      }
      render();
      if (drag || energy(rope) > SLEEP_EPSILON) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0; lastT = 0; acc = 0;
      }
    }
    const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };

    function markUsed() {
      used = true;
      if (hint) hint.classList.remove('is-on');
      try { localStorage.setItem(USED_KEY, '1'); } catch (err) {
        // Not persisted — the hint may simply show again on the next visit.
      }
    }

    function flip() { toggleTheme(bead); markUsed(); }

    function tug() {
      rope.stretchV = 0.075;
      wake();
      window.setTimeout(flip, 110);
    }

    function local(e) {
      const r = root.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function clampTarget(p) {
      const dx = p.x - anchor.x;
      const dy = Math.max(p.y - anchor.y, 20);
      const dist = Math.hypot(dx, dy);
      const max = rope.length * MAX_STRETCH;
      const k = dist > max ? max / dist : 1;
      return { x: anchor.x + dx * k, y: anchor.y + dy * k };
    }

    bead.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      bead.setPointerCapture(e.pointerId);
      const p = local(e);
      drag = { id: e.pointerId, x0: p.x, y0: p.y, moved: 0, maxPull: 0 };
      target = clampTarget(p);
      wake();
    });

    bead.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const p = local(e);
      target = clampTarget(p);
      const dist = Math.hypot(target.x - anchor.x, target.y - anchor.y);
      rope.stretch = Math.min(Math.max(dist / rope.length, 1), MAX_STRETCH);
      drag.moved = Math.max(drag.moved, Math.hypot(p.x - drag.x0, p.y - drag.y0));
      drag.maxPull = Math.max(drag.maxPull, dist - rope.length);
    });

    const endDrag = (e, fromUp) => {
      if (!drag || e.pointerId !== drag.id) return;
      const wasClick = drag.moved < 6;
      const pulled = drag.maxPull > PULL_TRIGGER;
      drag = null;
      target = null;
      if (fromUp) {
        // The browser fires a click right after pointerup; ignore that one only.
        skipNextClick = true;
        window.setTimeout(() => { skipNextClick = false; }, 400);
      }
      if (fromUp && wasClick) tug();
      else if (pulled) flip();
      wake();
    };
    bead.addEventListener('pointerup', (e) => endDrag(e, true));
    bead.addEventListener('pointercancel', (e) => endDrag(e, false));

    // Keyboard (Enter / Space) arrives as a click with no pointer gesture before it.
    bead.addEventListener('click', () => {
      if (skipNextClick) { skipNextClick = false; return; }
      tug();
    });

    window.setInterval(() => {
      if (used || drag || document.hidden || Z.reduced || nudges >= MAX_NUDGES) return;
      nudges += 1;
      const end = rope.pts[rope.pts.length - 1];
      end.px = end.x - 4.5;
      wake();
    }, NUDGE_EVERY_MS);

    window.addEventListener('resize', () => {
      const len = restLength();
      const ax = root.clientWidth / 2;
      if (len === rope.length && ax === anchor.x) return;
      anchor = { x: ax, y: -10 };
      rope = makeRope(anchor, len);
      render();
    });

    render();
    const end = rope.pts[rope.pts.length - 1];
    end.px = end.x + 7; // a gentle swing on arrival
    wake();

    Z.showCordHint = () => {
      if (used || !hint) return;
      hint.classList.add('is-on');
      window.setTimeout(() => hint.classList.remove('is-on'), HINT_VISIBLE_MS);
    };
  }

  Z.initCord = initCord;
})();
