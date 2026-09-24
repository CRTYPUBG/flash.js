// Events are Collection methods; standalone helpers for direct use
function on(target, events, handler, options) {
  const el = target instanceof Element ? target : document.querySelector(target);
  if (!el) return;
  events.split(/\s+/).forEach(evt => el.addEventListener(evt, handler, options));
}
function off(target, events, handler, options) {
  const el = target instanceof Element ? target : document.querySelector(target);
  if (!el) return;
  events.split(/\s+/).forEach(evt => el.removeEventListener(evt, handler, options));
}
function trigger(target, event, detail) {
  const el = target instanceof Element ? target : document.querySelector(target);
  if (!el) return;
  const e = typeof event === "string" ? new CustomEvent(event, { detail, bubbles: true, cancelable: true }) : event;
  el.dispatchEvent(e);
}

export { off, on, trigger };
