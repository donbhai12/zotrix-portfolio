/* Zotrix — "How we work": sticky odometer that rolls with the active step. */
(() => {
  'use strict';

  const Z = (window.Z = window.Z || {});
  const DIAL_STEP_DEG = 42;

  function initStory() {
    const steps = [...document.querySelectorAll('.story__line .step')];
    if (!steps.length) return;
    const cols = [...document.querySelectorAll('.odo__col')];
    const label = Z.byId('odoLbl');
    const now = Z.byId('odoNow');
    const bar = Z.byId('odoBar');
    const amb = [...document.querySelectorAll('.story__amb i')];
    const dial = document.querySelector('.dial');
    let active = -1;

    function setStep(i) {
      if (i < 0 || i === active) return;
      active = i;
      const num = String(i + 1).padStart(2, '0');
      cols.forEach((col, k) => { col.style.transform = `translateY(${-Number(num[k])}em)`; });
      if (label) label.textContent = steps[i].dataset.label || '';
      if (now) now.textContent = num;
      if (bar) bar.style.transform = `scaleX(${(i + 1) / steps.length})`;
      steps.forEach((s, k) => s.classList.toggle('is-now', k === i));
      amb.forEach((a, k) => a.classList.toggle('on', k === i % amb.length));
      if (dial) dial.style.setProperty('--rot', `${i * DIAL_STEP_DEG}deg`);
    }

    setStep(0);
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) setStep(steps.indexOf(en.target)); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach((s) => io.observe(s));
  }

  Z.initStory = initStory;
})();
