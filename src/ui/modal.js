import { ensureStyles } from "./toast.js";

export function modal({ title, message, actions, closeOnBackdrop = true }) {
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

export function alertBox(message, title = "Bildirim") {
  return modal({ title, message, actions: [{ label: "Tamam", value: true, variant: "primary" }] });
}

export function confirmBox(message, title = "Onay") {
  return modal({
    title, message,
    actions: [
      { label: "İptal", value: false, variant: "ghost" },
      { label: "Onayla", value: true, variant: "primary" },
    ],
  });
}

export default modal;
