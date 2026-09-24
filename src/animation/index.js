// Animation helpers — also available as Collection.animate/fadeIn/fadeOut
export async function animate(elements, keyframes, options = {}) {
  const els = Array.isArray(elements) ? elements : [elements];
  const kf = Array.isArray(keyframes) ? keyframes : [keyframes];
  const opts = typeof options === "number" ? { duration: options } : options;
  const anims = els.map(el => {
    if (el.animate) return el.animate(kf, { duration: 300, easing: "ease", fill: "forwards", ...opts });
    Object.assign(el.style, kf[kf.length-1] || {});
    return { finished: Promise.resolve() };
  });
  await Promise.all(anims.map(a => a.finished.catch(()=>{})));
  return els;
}

export async function fadeIn(el, duration = 300) {
  if (!el) return;
  el.style.display = "";
  return animate(el, [{opacity:0},{opacity:1}], { duration });
}
export async function fadeOut(el, duration = 300) {
  if (!el) return;
  await animate(el, [{opacity:1},{opacity:0}], { duration });
  el.style.display = "none";
}
