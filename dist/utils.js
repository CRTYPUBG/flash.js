const isElement    = (v) => typeof Element !== "undefined" && v instanceof Element;
const isString     = (v) => typeof v === "string";
const isFunction   = (v) => typeof v === "function";
const isObject     = (v) => v !== null && typeof v === "object";

const unique = (arr) => [...new Set(arr)];

function parseData(raw) {
  try { return JSON.parse(raw); } catch { return raw; }
}

function createFragment(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = String(html).trim();
  return tpl.content.firstElementChild || tpl.content;
}

function toArray(value) {
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

class Collection {
  constructor(elements) {
    this.elements = elements;
    this.length = elements.length;
    for (let i = 0; i < elements.length; i++) this[i] = elements[i];
  }

  [Symbol.iterator]() { return this.elements[Symbol.iterator](); }

  get(index) {
    if (index === undefined) return this.elements;
    return index < 0 ? this.elements[this.length + index] : this.elements[index];
  }

  each(fn)   { this.elements.forEach((el, i) => fn.call(el, i, el)); return this; }
  map(fn)    { return this.elements.map((el, i) => fn.call(el, i, el)); }
  filter(fn) { return new Collection(this.elements.filter((el, i) => fn.call(el, i, el))); }
  first()    { return new Collection(this.elements.slice(0, 1)); }
  last()     { return new Collection(this.elements.slice(-1)); }
  eq(i)      { const el = this.elements[i < 0 ? this.length + i : i]; return new Collection(el ? [el] : []); }

  /* Classes */
  addClass(...names) {
    const cls = names.flat().filter(Boolean).flatMap(s => String(s).split(/\s+/)).filter(Boolean);
    return this.each((_, el) => el.classList.add(...cls));
  }
  removeClass(...names) {
    const cls = names.flat().filter(Boolean).flatMap(s => String(s).split(/\s+/)).filter(Boolean);
    return this.each((_, el) => el.classList.remove(...cls));
  }
  toggleClass(name, force) {
    return this.each((_, el) => el.classList.toggle(name, force));
  }
  hasClass(name) {
    return this.elements.some((el) => el.classList.contains(name));
  }

  /* Attributes */
  attr(name, value) {
    if (isObject(name) && !Array.isArray(name)) {
      return this.each((_, el) => Object.entries(name).forEach(([k, v]) => el.setAttribute(k, v)));
    }
    if (value === undefined) return this.elements[0]?.getAttribute(name) ?? null;
    if (value === null) return this.removeAttr(name);
    return this.each((_, el) => el.setAttribute(name, value));
  }
  removeAttr(...names) {
    const list = names.flat();
    return this.each((_, el) => list.forEach((n) => el.removeAttribute(n)));
  }
  prop(name, value) {
    if (value === undefined) return this.elements[0]?.[name];
    return this.each((_, el) => { el[name] = value; });
  }
  removeProp(name) { return this.each((_, el) => { try { delete el[name]; } catch {} }); }

  /* Data */
  data(key, value) {
    if (value === undefined && isString(key)) {
      const el = this.elements[0];
      if (!el) return undefined;
      const raw = el.dataset[key];
      return raw === undefined ? undefined : parseData(raw);
    }
    if (isObject(key) && !Array.isArray(key)) {
      return this.each((_, el) => Object.entries(key).forEach(([k, v]) => { el.dataset[k] = isString(v) ? v : JSON.stringify(v); }));
    }
    if (isString(key) && value !== undefined) {
      return this.each((_, el) => { el.dataset[key] = isString(value) ? value : JSON.stringify(value); });
    }
    return this;
  }
  removeData(key) { return this.each((_, el) => { delete el.dataset[key]; }); }

  /* CSS */
  css(prop, value) {
    if (isObject(prop) && !Array.isArray(prop)) return this.each((_, el) => Object.assign(el.style, prop));
    if (value === undefined) {
      const el = this.elements[0];
      if (!el) return undefined;
      return getComputedStyle(el)[prop];
    }
    return this.each((_, el) => { el.style[prop] = value; });
  }

  /* Content */
  html(value) {
    if (value === undefined) return this.elements[0]?.innerHTML ?? "";
    return this.each((_, el) => {
      if (value && typeof value === "object" && "elements" in value) {
        el.innerHTML = "";
        toArray(value).forEach((node) => el.appendChild(node.cloneNode(true)));
      } else if (isElement(value)) {
        el.innerHTML = "";
        el.appendChild(value.cloneNode(true));
      } else {
        el.innerHTML = value;
      }
    });
  }
  text(value) {
    if (value === undefined) return this.elements[0]?.textContent ?? "";
    return this.each((_, el) => { el.textContent = value; });
  }
  val(value) {
    if (value === undefined) return this.elements[0]?.value;
    return this.each((_, el) => { el.value = value; });
  }

  /* Visibility */
  show(display = "") { return this.each((_, el) => { el.style.display = display; }); }
  hide()             { return this.each((_, el) => { el.style.display = "none"; }); }
  toggle(display = "") {
    return this.each((_, el) => {
      el.style.display = getComputedStyle(el).display === "none" ? display : "none";
    });
  }

  /* Manipulation */
  append(content) {
    const nodes = toArray(content);
    return this.each((_, el) => nodes.forEach((n) => el.appendChild(isString(n) ? createFragment(n) : n.cloneNode(true))));
  }
  prepend(content) {
    const nodes = toArray(content);
    return this.each((_, el) => nodes.forEach((n) => {
      const node = isString(n) ? createFragment(n) : n.cloneNode(true);
      el.insertBefore(node, el.firstChild);
    }));
  }
  before(content) {
    const nodes = toArray(content);
    return this.each((_, el) => nodes.forEach((n) => {
      const node = isString(n) ? createFragment(n) : n.cloneNode(true);
      el.parentNode?.insertBefore(node, el);
    }));
  }
  after(content) {
    const nodes = toArray(content);
    return this.each((_, el) => nodes.forEach((n) => {
      const node = isString(n) ? createFragment(n) : n.cloneNode(true);
      el.parentNode?.insertBefore(node, el.nextSibling);
    }));
  }
  remove() { return this.each((_, el) => el.remove()); }
  empty()  { return this.each((_, el) => { el.innerHTML = ""; }); }
  clone(deep = true) { return new Collection(this.elements.map(el => el.cloneNode(deep))); }

  /* Traversal */
  find(selector) {
    const results = [];
    this.each((_, el) => results.push(...el.querySelectorAll(selector)));
    return new Collection(unique(results));
  }
  parent() { return new Collection(unique(this.elements.map((el) => el.parentElement).filter(Boolean))); }
  parents(selector) {
    const results = [];
    this.each((_, el) => {
      let p = el.parentElement;
      while (p) { if (!selector || p.matches(selector)) results.push(p); p = p.parentElement; }
    });
    return new Collection(unique(results));
  }
  children(selector) {
    const results = [];
    this.each((_, el) => results.push(...el.children));
    return new Collection(unique(selector ? results.filter((el) => el.matches(selector)) : results));
  }
  closest(selector) {
    const results = [];
    this.each((_, el) => { const c = el.closest(selector); if (c) results.push(c); });
    return new Collection(unique(results));
  }
  siblings(selector) {
    const results = [];
    this.each((_, el) => {
      if (!el.parentElement) return;
      [...el.parentElement.children].forEach((sib) => {
        if (sib !== el && (!selector || sib.matches(selector))) results.push(sib);
      });
    });
    return new Collection(unique(results));
  }
  next(selector) {
    const results = [];
    this.each((_, el) => {
      const n = el.nextElementSibling;
      if (n && (!selector || n.matches(selector))) results.push(n);
    });
    return new Collection(results);
  }
  prev(selector) {
    const results = [];
    this.each((_, el) => {
      const n = el.previousElementSibling;
      if (n && (!selector || n.matches(selector))) results.push(n);
    });
    return new Collection(results);
  }
  is(selector) { return this.elements.some((el) => el.matches(selector)); }
  index(selector) {
    const el = this.elements[0];
    if (!el) return -1;
    if (selector) return [...document.querySelectorAll(selector)].indexOf(el);
    if (!el.parentElement) return -1;
    return [...el.parentElement.children].indexOf(el);
  }

  /* Events */
  on(events, selectorOrHandler, handlerOrOptions, options) {
    const eventList = events.split(/\s+/).filter(Boolean);
    let selector = null, handler, opts = {};
    if (isString(selectorOrHandler)) {
      selector = selectorOrHandler; handler = handlerOrOptions; opts = options || {};
    } else { handler = selectorOrHandler; opts = handlerOrOptions || {}; }
    return this.each((_, el) => {
      eventList.forEach((evt) => {
        const wrapped = selector
          ? (e) => { const target = e.target.closest(selector); if (target && el.contains(target)) handler.call(target, e, target); }
          : handler;
        if (!el.__flashHandlers) el.__flashHandlers = [];
        el.__flashHandlers.push({ evt, handler, wrapped, selector, opts });
        el.addEventListener(evt, wrapped, opts);
      });
    });
  }
  off(events, handler) {
    const eventList = events ? events.split(/\s+/).filter(Boolean) : null;
    return this.each((_, el) => {
      const handlers = el.__flashHandlers || [];
      const remaining = [];
      handlers.forEach((h) => {
        const shouldRemove = (!eventList || eventList.includes(h.evt)) && (!handler || h.handler === handler);
        if (shouldRemove) el.removeEventListener(h.evt, h.wrapped, h.opts);
        else remaining.push(h);
      });
      el.__flashHandlers = remaining;
    });
  }
  one(events, handler) {
    const eventList = events.split(/\s+/).filter(Boolean);
    return this.each((_, el) => {
      eventList.forEach((evt) => {
        const wrap = (e) => { handler.call(el, e); el.removeEventListener(evt, wrap); };
        el.addEventListener(evt, wrap, { once: true });
      });
    });
  }
  trigger(event, detail) {
    const e = isString(event) ? new CustomEvent(event, { detail, bubbles: true, cancelable: true }) : event;
    return this.each((_, el) => el.dispatchEvent(e));
  }

  /* Effects */
  async animate(keyframes, options = {}) {
    const opts = typeof options === "number" ? { duration: options } : options;
    const kf = Array.isArray(keyframes) ? keyframes : [keyframes];
    const animations = this.elements.map((el) => {
      if (el.animate) return el.animate(kf, { duration: 300, easing: "ease", fill: "forwards", ...opts });
      const last = kf[kf.length - 1] || {};
      Object.assign(el.style, last);
      return { finished: Promise.resolve() };
    });
    await Promise.all(animations.map((a) => a.finished.catch(() => {})));
    return this;
  }
  async fadeIn(duration = 300)  { this.show(); return this.animate([{ opacity: 0 }, { opacity: 1 }], { duration }); }
  async fadeOut(duration = 300) { await this.animate([{ opacity: 1 }, { opacity: 0 }], { duration }); return this.hide(); }
  async slideDown(duration = 300) {
    this.show();
    const el = this.elements[0]; if (!el) return this;
    const h = el.scrollHeight;
    return this.animate([{ height: "0px", overflow: "hidden" }, { height: h + "px", overflow: "hidden" }], { duration });
  }
  async slideUp(duration = 300) {
    await this.animate([{ height: this.elements[0]?.scrollHeight + "px" }, { height: "0px" }], { duration });
    return this.hide();
  }

  /* Observers */
  observe(callback, options = {}) {
    const observer = new MutationObserver(callback);
    this.each((_, el) => observer.observe(el, { childList: true, subtree: true, attributes: true, ...options }));
    return observer;
  }
  visible(callback, options = {}) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => callback(entry.isIntersecting, entry)), options);
    this.each((_, el) => observer.observe(el));
    return observer;
  }
  resize(callback, options = {}) {
    const observer = new ResizeObserver((entries) => entries.forEach((entry) => callback(entry.contentRect, entry)), options);
    this.each((_, el) => observer.observe(el, options));
    return observer;
  }
}

const VERSION = "1.0.0";

function F(target) {
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

export { F, VERSION, createFragment, isElement, isFunction, isObject, isString, parseData, toArray, unique };
