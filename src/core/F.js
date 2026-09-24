import { Collection } from "./collection.js";
import { isElement, isString, isObject, isFunction, unique, toArray } from "./utils.js";

export const VERSION = "1.0.0";

export function F(target) {
  if (target instanceof Collection) return target;
  if (isFunction(target)) return F.ready(target);

  if (isString(target)) {
    const trimmed = target.trim();
    if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
      const tpl = document.createElement("template");
      tpl.innerHTML = trimmed;
      return new Collection([...tpl.content.children]);
    }
    try { return new Collection([...document.querySelectorAll(trimmed)]); }
    catch { return new Collection([]); }
  }

  if (
    (typeof Window !== "undefined" && target instanceof Window) ||
    (typeof Document !== "undefined" && target instanceof Document) ||
    isElement(target)
  ) {
    return new Collection([target]);
  }

  return new Collection(toArray(target));
}

F.version = VERSION;
F.Collection = Collection;

F.ready = function (callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => callback(F), { once: true });
  } else {
    callback(F);
  }
  return F;
};

F.each = function (obj, fn) {
  if (obj instanceof Collection) return obj.each(fn);
  if (Array.isArray(obj)) obj.forEach((v, i) => fn.call(v, i, v));
  else if (isObject(obj)) Object.entries(obj).forEach(([k, v]) => fn.call(v, k, v));
  return obj;
};

F.map = (arr, fn) => [...arr].map(fn);
F.filter = (arr, fn) => [...arr].filter(fn);
F.extend = (target, ...sources) => Object.assign(target, ...sources);
F.unique = unique;
F.toArray = toArray;

F.type = function (v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
};
F.isEmpty = function (v) {
  if (v == null) return true;
  if (isString(v) || Array.isArray(v)) return v.length === 0;
  if (v instanceof Collection) return v.length === 0;
  if (isObject(v)) return Object.keys(v).length === 0;
  return false;
};

export default F;
