// Observers are Collection methods, but expose standalone helpers for tree-shaking
export function observe(target, callback, options = {}) {
  const el = target instanceof Element ? target : document.querySelector(target);
  if (!el) return null;
  const obs = new MutationObserver(callback);
  obs.observe(el, { childList: true, subtree: true, attributes: true, ...options });
  return obs;
}

export function visible(target, callback, options = {}) {
  const el = target instanceof Element ? target : document.querySelector(target);
  if (!el) return null;
  const obs = new IntersectionObserver((entries) => entries.forEach(e => callback(e.isIntersecting, e)), options);
  obs.observe(el);
  return obs;
}

export function resize(target, callback, options = {}) {
  const el = target instanceof Element ? target : document.querySelector(target);
  if (!el) return null;
  const obs = new ResizeObserver((entries) => entries.forEach(e => callback(e.contentRect, e)), options);
  obs.observe(el, options);
  return obs;
}
