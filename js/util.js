/* Zotrix — shared helpers. Loaded first; every other script reads window.Z. */
(() => {
  'use strict';

  const Z = (window.Z = window.Z || {});
  const handlers = {};
  let toastTimer = 0;

  Z.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  Z.byId = (id) => document.getElementById(id);

  /** Re-trigger a CSS animation that is keyed off a class. */
  Z.restart = (node, cls) => {
    node.classList.remove(cls);
    void node.offsetWidth; // force reflow so the animation starts again
    node.classList.add(cls);
  };

  /** Tiny element builder — text goes through textContent, never innerHTML. */
  Z.el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value;
      else if (key === 'class') node.className = value;
      else node.setAttribute(key, value);
    });
    children.forEach((child) => { if (child) node.appendChild(child); });
    return node;
  };

  Z.on = (name, fn) => { (handlers[name] = handlers[name] || []).push(fn); };
  Z.emit = (name, payload) => { (handlers[name] || []).forEach((fn) => fn(payload)); };

  Z.toast = (message, ms = 3200) => {
    const box = Z.byId('toast');
    if (!box) return;
    box.textContent = message;
    box.classList.add('is-on');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => box.classList.remove('is-on'), ms);
  };
})();
