export const isElement    = (v) => typeof Element !== "undefined" && v instanceof Element;
export const isString     = (v) => typeof v === "string";
export const isFunction   = (v) => typeof v === "function";
export const isObject     = (v) => v !== null && typeof v === "object";

export const unique = (arr) => [...new Set(arr)];

export function parseData(raw) {
  try { return JSON.parse(raw); } catch { return raw; }
}

export function createFragment(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = String(html).trim();
  return tpl.content.firstElementChild || tpl.content;
}

export function toArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (value instanceof NodeList || value instanceof HTMLCollection) return [...value];
  // Collection check via duck typing to avoid circular import
  if (value && typeof value === "object" && "elements" in value && Array.isArray(value.elements)) return value.elements;
  if (typeof Element !== "undefined" && value instanceof Element) return [value];
  if (typeof Document !== "undefined" && value instanceof Document) return [value];
  if (typeof Window !== "undefined" && value instanceof Window) return [value];
  return [];
}
