import { ensureStyles } from "./toast.js";

let loadingEl = null;
let loadingCount = 0;

export function loading(show = true) {
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

export default loading;
