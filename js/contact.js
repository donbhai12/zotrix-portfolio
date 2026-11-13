/* Zotrix — "Say hello" dialog.
   No server needed: the form opens the visitor's email app with everything
   filled in, or copies a ready message and opens an Instagram DM. */
(() => {
  'use strict';

  const Z = (window.Z = window.Z || {});
  const EMAIL = 'zotrixtechmedia@gmail.com';
  const IG_DM = 'https://ig.me/m/zotrixtechmedia';
  const MIN_LEN = 2;

  function collect(form) {
    const data = new FormData(form);
    const text = (key) => String(data.get(key) || '').trim();
    return {
      name: text('name'),
      business: text('business'),
      city: text('city'),
      needs: data.getAll('need').map(String),
      budget: text('budget'),
      message: text('message'),
    };
  }

  function setError(form, field, message) {
    const input = form.elements[field];
    if (!input) return;
    const wrap = input.closest('.field');
    const err = wrap && wrap.querySelector('.err');
    if (wrap) wrap.classList.toggle('is-bad', Boolean(message));
    input.setAttribute('aria-invalid', String(Boolean(message)));
    if (err) err.textContent = message;
  }

  function validate(form, d) {
    const nameMsg = d.name.length < MIN_LEN ? 'Please tell us your name.' : '';
    const bizMsg = d.business.length < MIN_LEN ? 'Which business is this for?' : '';
    setError(form, 'name', nameMsg);
    setError(form, 'business', bizMsg);
    const firstBad = (nameMsg && 'name') || (bizMsg && 'business') || '';
    if (firstBad) form.elements[firstBad].focus();
    return !firstBad;
  }

  function emailBody(d) {
    return [
      'Hi Zotrix team,',
      '',
      `Name: ${d.name}`,
      `Business: ${d.business}`,
      ...(d.city ? [`City / country: ${d.city}`] : []),
      `Looking for: ${d.needs.length ? d.needs.join(', ') : 'Not sure yet'}`,
      ...(d.budget ? [`Budget in mind: ${d.budget}`] : []),
      ...(d.message ? ['', d.message] : []),
      '',
      '— Sent from the Zotrix website',
    ].join('\n');
  }

  function dmText(d) {
    const who = [d.name, d.business && `from ${d.business}`, d.city && `(${d.city})`].filter(Boolean).join(' ');
    const needs = d.needs.length ? ` Looking for: ${d.needs.join(', ')}.` : '';
    const budget = d.budget ? ` Budget: ${d.budget}.` : '';
    const note = d.message ? ` ${d.message}` : '';
    return `Hi Zotrix! ${who ? `I'm ${who}.` : 'I’d like to work with you.'}${needs}${budget}${note}`;
  }

  async function copyText(text) {
    if (!navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      return false; // permission denied or page not focused — we fall back to a hint
    }
  }

  function initContact() {
    const dlg = Z.byId('hello');
    const form = Z.byId('helloForm');
    if (!dlg || !form) return;
    const note = Z.byId('helloNote');
    const igBtn = Z.byId('helloIg');
    let lastFocus = null;

    function onClosed() {
      document.documentElement.classList.remove('has-modal');
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    function open(need, opener) {
      const from = opener || document.activeElement;
      // The mobile menu hides itself after a tap, so return focus to its button instead.
      lastFocus = from && from.closest && from.closest('#mnav') ? Z.byId('menuBtn') : from;
      if (need) {
        form.querySelectorAll('input[name="need"]').forEach((box) => { box.checked = box.value === need; });
      }
      note.textContent = '';
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
      document.documentElement.classList.add('has-modal');
      window.setTimeout(() => form.elements.name.focus(), 60);
    }

    function close() {
      if (typeof dlg.close === 'function') { dlg.close(); return; }
      dlg.removeAttribute('open');
      onClosed();
    }

    dlg.addEventListener('close', onClosed);
    // Close on a real backdrop click only — not when a text selection ends outside the box.
    let downOnBackdrop = false;
    dlg.addEventListener('pointerdown', (e) => { downOnBackdrop = e.target === dlg; });
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg && downOnBackdrop) close();
      downOnBackdrop = false;
    });
    form.querySelectorAll('[data-close]').forEach((btn) => btn.addEventListener('click', close));

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-contact]');
      if (!trigger) return;
      e.preventDefault();
      open(trigger.dataset.need, trigger);
    });

    form.addEventListener('input', (e) => {
      const wrap = e.target.closest('.field');
      if (wrap && wrap.classList.contains('is-bad')) setError(form, e.target.name, '');
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = collect(form);
      if (!validate(form, d)) return;
      const subject = `New project enquiry — ${d.business}`;
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody(d))}`;
      note.textContent = `Opening your email app… If nothing opens, write to ${EMAIL}`;
    });

    if (igBtn) {
      igBtn.addEventListener('click', async () => {
        // Start the copy, but open Instagram right away: Safari blocks popups opened after an await.
        const pending = copyText(dmText(collect(form)));
        window.open(IG_DM, '_blank', 'noopener');
        const copied = await pending;
        note.textContent = copied
          ? 'Message copied — just paste it in the Instagram DM.'
          : 'Opening Instagram — type “WEBSITE” in the DM and we’ll reply.';
      });
    }

    Z.openContact = open;
  }

  Z.initContact = initContact;
})();
