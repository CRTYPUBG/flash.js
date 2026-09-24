const isString     = (v) => typeof v === "string";

const STYLE_ID = "flash-styles";

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .flash-toast-container{position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;pointer-events:none;max-width:100vw}
    .flash-toast{background:#111;color:#fff;padding:.75rem 1rem;border-radius:.5rem;
      font:14px/1.4 system-ui,-apple-system,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.2);
      animation:flash-in .2s ease;pointer-events:auto;max-width:320px;word-break:break-word}
    .flash-toast.success{background:#0a7a3b}
    .flash-toast.error{background:#b00020}
    .flash-toast.warn,.flash-toast.warning{background:#a35c00}
    .flash-toast.info{background:#0b5fff}
    @keyframes flash-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
    .flash-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;
      align-items:center;justify-content:center;z-index:10000;animation:flash-fade .15s ease;padding:1rem}
    .flash-modal{background:#fff;color:#111;border-radius:.75rem;padding:1.25rem 1.5rem;
      min-width:280px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.3);
      font:14px/1.5 system-ui,-apple-system,sans-serif}
    .flash-modal h3{margin:0 0 .5rem;font-size:1rem;font-weight:600}
    .flash-modal p{margin:0 0 1rem;color:#444;white-space:pre-wrap}
    .flash-modal-actions{display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap}
    .flash-btn{border:0;border-radius:.4rem;padding:.5rem .9rem;font:inherit;cursor:pointer;transition:opacity .15s}
    .flash-btn:hover{opacity:.9}
    .flash-btn.primary{background:#111;color:#fff}
    .flash-btn.ghost{background:#eee;color:#111}
    .flash-loading{position:fixed;inset:0;background:rgba(255,255,255,.7);
      display:flex;align-items:center;justify-content:center;z-index:10001;backdrop-filter:blur(2px)}
    .flash-spinner{width:36px;height:36px;border:3px solid #ddd;border-top-color:#111;
      border-radius:50%;animation:flash-spin .8s linear infinite}
    @keyframes flash-fade{from{opacity:0}to{opacity:1}}
    @keyframes flash-spin{to{transform:rotate(360deg)}}
    [data-theme="dark"] .flash-modal{background:#1c1c1e;color:#f2f2f7}
    [data-theme="dark"] .flash-loading{background:rgba(0,0,0,.6)}
  `;
  document.head.appendChild(style);
}

function ensureStyles() { injectStyles(); }

function toast(message, options = {}) {
  injectStyles();
  const opts = isString(options) ? { type: options } : options;
  const { type = "info", duration = 3000 } = opts;
  let container = document.querySelector(".flash-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "flash-toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  const el = document.createElement("div");
  el.className = `flash-toast ${type}`;
  el.setAttribute("role", "status");
  el.textContent = message;
  container.appendChild(el);
  const t = setTimeout(() => {
    el.style.transition = "opacity .2s, transform .2s";
    el.style.opacity = "0";
    el.style.transform = "translateX(10px)";
    setTimeout(() => { el.remove(); if (!container.children.length) container.remove(); }, 200);
  }, duration);
  el.addEventListener("click", () => { clearTimeout(t); el.remove(); });
  return el;
}

function modal({ title, message, actions, closeOnBackdrop = true }) {
  ensureStyles();
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "flash-modal-backdrop";
    backdrop.innerHTML = `
      <div class="flash-modal" role="dialog" aria-modal="true">
        ${title ? "<h3></h3>" : ""}
        ${message ? "<p></p>" : ""}
        <div class="flash-modal-actions"></div>
      </div>`;
    const modalEl = backdrop.firstElementChild;
    if (title) modalEl.querySelector("h3").textContent = title;
    if (message) modalEl.querySelector("p").textContent = message;
    const actionsEl = modalEl.querySelector(".flash-modal-actions");
    (actions || []).forEach((action, i) => {
      const btn = document.createElement("button");
      btn.className = `flash-btn ${action.variant || (i === actions.length - 1 ? "primary" : "ghost")}`;
      btn.textContent = action.label;
      btn.onclick = () => { backdrop.remove(); document.removeEventListener("keydown", onKey); resolve(action.value); };
      actionsEl.appendChild(btn);
    });
    const onKey = (e) => { if (e.key === "Escape") { backdrop.remove(); document.removeEventListener("keydown", onKey); resolve(null); } };
    document.addEventListener("keydown", onKey);
    if (closeOnBackdrop) {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) { backdrop.remove(); document.removeEventListener("keydown", onKey); resolve(null); }
      });
    }
    document.body.appendChild(backdrop);
    actionsEl.querySelector(".flash-btn")?.focus();
  });
}

function alertBox(message, title = "Bildirim") {
  return modal({ title, message, actions: [{ label: "Tamam", value: true, variant: "primary" }] });
}

function confirmBox(message, title = "Onay") {
  return modal({
    title, message,
    actions: [
      { label: "İptal", value: false, variant: "ghost" },
      { label: "Onayla", value: true, variant: "primary" },
    ],
  });
}

let loadingEl = null;
let loadingCount = 0;

function loading(show = true) {
  ensureStyles();
  if (show) {
    loadingCount++;
    if (loadingEl) return;
    loadingEl = document.createElement("div");
    loadingEl.className = "flash-loading";
    loadingEl.setAttribute("aria-busy", "true");
    loadingEl.innerHTML = '<div class="flash-spinner" aria-label="loading"></div>';
    document.body.appendChild(loadingEl);
  } else {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount === 0) {
      loadingEl?.remove();
      loadingEl = null;
    }
  }
}

export { alertBox as alert, confirmBox as confirm, loading, modal, toast };
