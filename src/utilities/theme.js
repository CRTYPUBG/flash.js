export function theme(mode) {
  if (!mode) return document.documentElement.dataset.theme || localStorage.getItem("flash:theme")?.replace(/"/g,"") || "light";
  document.documentElement.dataset.theme = mode;
  try { localStorage.setItem("flash:theme", JSON.stringify(mode)); } catch {}
  document.dispatchEvent(new CustomEvent("flash:theme", { detail: mode }));
  return mode;
}
// auto-restore
try {
  const saved = JSON.parse(localStorage.getItem("flash:theme") || "null");
  if (saved) document.documentElement.dataset.theme = saved;
} catch {}

export default theme;
