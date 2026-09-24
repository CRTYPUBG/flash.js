/*!
 * FLASH.js v1.0.0
 * jQuery, reimagined for the modern web.
 * Fast Lightweight UI / HTML System — zero dependencies, ESM-first, tree-shakable
 * MIT License · https://github.com/CRTYPUBG/flash.js
 */
(function (global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define(factory);
  } else {
    global.Flash = factory();
    global.F = global.Flash;
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = "1.0.0";

  /* ----------------------------- Utils ----------------------------- */
  const isElement    = (v) => typeof Element !== "undefined" && v instanceof Element;
  const isCollection = (v) => v instanceof Collection;
  const isString     = (v) => typeof v === "string";
  const isFunction   = (v) => typeof v === "function";
  const isObject     = (v) => v !== null && typeof v === "object";

  const unique = (arr) => [...new Set(arr)];

  function toArray(value) {
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    if (value instanceof NodeList || value instanceof HTMLCollection) return [...value];
    if (value instanceof Collection) return value.elements;
    if (typeof Element !== "undefined" && isElement(value)) return [value];
    if (typeof Document !== "undefined" && value instanceof Document) return [value];
    if (typeof Window !== "undefined" && value instanceof Window) return [value];
    return [];
  }

  function parseData(raw) {
    try { return JSON.parse(raw); } catch { return raw; }
  }

  function createFragment(html) {
    const tpl = document.createElement("template");
    tpl.innerHTML = String(html).trim();
    return tpl.content.firstElementChild || tpl.content;
  }

  /* --------------------------- Collection -------------------------- */
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
        return this.each((_, el) =>
          Object.entries(name).forEach(([k, v]) => el.setAttribute(k, v))
        );
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
    removeProp(name) {
      return this.each((_, el) => { try { delete el[name]; } catch {} });
    }

    /* Data — dataset + JSON auto parse */
    data(key, value) {
      if (value === undefined && isString(key)) {
        const el = this.elements[0];
        if (!el) return undefined;
        const raw = el.dataset[key];
        return raw === undefined ? undefined : parseData(raw);
      }
      if (isObject(key) && !Array.isArray(key)) {
        return this.each((_, el) =>
          Object.entries(key).forEach(([k, v]) => {
            el.dataset[k] = isString(v) ? v : JSON.stringify(v);
          })
        );
      }
      if (isString(key) && value !== undefined) {
        return this.each((_, el) => {
          el.dataset[key] = isString(value) ? value : JSON.stringify(value);
        });
      }
      return this;
    }
    removeData(key) {
      return this.each((_, el) => { delete el.dataset[key]; });
    }

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
        if (value instanceof Collection || isElement(value)) {
          el.innerHTML = "";
          toArray(value).forEach((node) => el.appendChild(node.cloneNode(true)));
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
      return this.each((_, el) =>
        nodes.forEach((n) =>
          el.appendChild(isString(n) ? createFragment(n) : n.cloneNode(true))
        )
      );
    }
    prepend(content) {
      const nodes = toArray(content);
      return this.each((_, el) =>
        nodes.forEach((n) => {
          const node = isString(n) ? createFragment(n) : n.cloneNode(true);
          el.insertBefore(node, el.firstChild);
        })
      );
    }
    before(content) {
      const nodes = toArray(content);
      return this.each((_, el) =>
        nodes.forEach((n) => {
          const node = isString(n) ? createFragment(n) : n.cloneNode(true);
          el.parentNode?.insertBefore(node, el);
        })
      );
    }
    after(content) {
      const nodes = toArray(content);
      return this.each((_, el) =>
        nodes.forEach((n) => {
          const node = isString(n) ? createFragment(n) : n.cloneNode(true);
          el.parentNode?.insertBefore(node, el.nextSibling);
        })
      );
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
    parent() {
      return new Collection(unique(this.elements.map((el) => el.parentElement).filter(Boolean)));
    }
    parents(selector) {
      const results = [];
      this.each((_, el) => {
        let p = el.parentElement;
        while (p) {
          if (!selector || p.matches(selector)) results.push(p);
          p = p.parentElement;
        }
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
      this.each((_, el) => {
        const c = el.closest(selector);
        if (c) results.push(c);
      });
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
    is(selector) {
      return this.elements.some((el) => el.matches(selector));
    }
    index(selector) {
      const el = this.elements[0];
      if (!el) return -1;
      if (selector) {
        const list = [...document.querySelectorAll(selector)];
        return list.indexOf(el);
      }
      if (!el.parentElement) return -1;
      return [...el.parentElement.children].indexOf(el);
    }

    /* Events */
    on(events, selectorOrHandler, handlerOrOptions, options) {
      const eventList = events.split(/\s+/).filter(Boolean);
      let selector = null, handler, opts = {};

      if (isString(selectorOrHandler)) {
        selector = selectorOrHandler;
        handler = handlerOrOptions;
        opts = options || {};
      } else {
        handler = selectorOrHandler;
        opts = handlerOrOptions || {};
      }

      return this.each((_, el) => {
        eventList.forEach((evt) => {
          const wrapped = selector
            ? (e) => {
                const target = e.target.closest(selector);
                if (target && el.contains(target)) handler.call(target, e, target);
              }
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
          const wrap = (e) => {
            handler.call(el, e);
            el.removeEventListener(evt, wrap);
          };
          el.addEventListener(evt, wrap, { once: true });
        });
      });
    }
    trigger(event, detail) {
      const e = isString(event)
        ? new CustomEvent(event, { detail, bubbles: true, cancelable: true })
        : event;
      return this.each((_, el) => el.dispatchEvent(e));
    }

    /* Effects — Web Animations API with fallback */
    async animate(keyframes, options = {}) {
      const opts = typeof options === "number" ? { duration: options } : options;
      // normalize keyframes: allow object like {opacity:0} → [{opacity:0}]
      const kf = Array.isArray(keyframes) ? keyframes : [keyframes];
      const animations = this.elements.map((el) => {
        if (el.animate) {
          return el.animate(kf, {
            duration: 300,
            easing: "ease",
            fill: "forwards",
            ...opts,
          });
        }
        // fallback: apply final frame synchronously
        const last = kf[kf.length - 1] || {};
        Object.assign(el.style, last);
        return { finished: Promise.resolve(), cancel() {}, play() {} };
      });
      await Promise.all(animations.map((a) => a.finished.catch(() => {})));
      return this;
    }
    async fadeIn(duration = 300) {
      this.show();
      return this.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
    }
    async fadeOut(duration = 300) {
      await this.animate([{ opacity: 1 }, { opacity: 0 }], { duration });
      return this.hide();
    }
    async slideDown(duration = 300) {
      this.show();
      const el = this.elements[0];
      if (!el) return this;
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
      this.each((_, el) =>
        observer.observe(el, { childList: true, subtree: true, attributes: true, ...options })
      );
      return observer;
    }
    visible(callback, options = {}) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => callback(entry.isIntersecting, entry));
      }, options);
      this.each((_, el) => observer.observe(el));
      return observer;
    }
    resize(callback, options = {}) {
      const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => callback(entry.contentRect, entry));
      });
      this.each((_, el) => observer.observe(el, options));
      return observer;
    }
  }

  /* ------------------------------- F() ----------------------------- */
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
      // CSS selector
      try {
        return new Collection([...document.querySelectorAll(trimmed)]);
      } catch {
        return new Collection([]);
      }
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

  /* Ready */
  F.ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => callback(F), { once: true });
    } else {
      callback(F);
    }
    return F;
  };

  /* Utilities */
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

  /* ----------------------------- HTTP ------------------------------ */
  const http = {
    async request(url, options = {}) {
      const { body, json, headers, timeout, ...rest } = options;
      const controller = new AbortController();
      const timer = timeout ? setTimeout(() => controller.abort(), timeout) : null;

      let payload = body;
      const finalHeaders = { ...(headers || {}) };

      if (json !== undefined) {
        payload = JSON.stringify(json);
        if (!finalHeaders["Content-Type"] && !finalHeaders["content-type"]) finalHeaders["Content-Type"] = "application/json";
      }

      // FormData / URLSearchParams auto headers handled by fetch
      try {
        const res = await fetch(url, {
          ...rest,
          body: payload,
          headers: finalHeaders,
          signal: controller.signal,
        });
        if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status} ${res.statusText}`), { status: res.status, response: res });
        return res;
      } finally {
        if (timer) clearTimeout(timer);
      }
    },
    async json(url, options) { return (await http.request(url, options)).json(); },
    async text(url, options) { return (await http.request(url, options)).text(); },
    async blob(url, options) { return (await http.request(url, options)).blob(); },
    async arrayBuffer(url, options) { return (await http.request(url, options)).arrayBuffer(); },
    get(url, options = {})        { return http.request(url, { ...options, method: "GET" }); },
    post(url, body, options = {}) { 
      // allow post(url, {json}) sugar
      if (body && isObject(body) && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof URLSearchParams) && !isString(body) && !options.json) {
        // if options has no method/body confusion, treat as json if no explicit body type
        // keep backwards compat: post(url, bodyObj) -> body as JSON? Use json option
      }
      return http.request(url, { ...options, method: "POST", body }); 
    },
    put(url, body, options = {})  { return http.request(url, { ...options, method: "PUT", body }); },
    patch(url, body, options = {}){ return http.request(url, { ...options, method: "PATCH", body }); },
    delete(url, options = {})     { return http.request(url, { ...options, method: "DELETE" }); },
  };

  /* --------------------------- Storage ----------------------------- */
  const storage = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch { return fallback; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); return value; },
    remove(key)     { localStorage.removeItem(key); },
    clear()         { localStorage.clear(); },
    has(key)        { return localStorage.getItem(key) !== null; },
    // session variant
    session: {
      get(k, fb=null) { try{ const r=sessionStorage.getItem(k); return r===null?fb:JSON.parse(r);}catch{return fb;}},
      set(k,v){ sessionStorage.setItem(k, JSON.stringify(v)); return v; },
      remove(k){ sessionStorage.removeItem(k); },
      clear(){ sessionStorage.clear(); },
      has(k){ return sessionStorage.getItem(k)!==null; }
    }
  };

  /* --------------------------- Utilities --------------------------- */
  async function copy(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch {}
      ta.remove();
    }
    return true;
  }

  function download(filename, data, mime = "text/plain") {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function theme(mode) {
    if (!mode) return document.documentElement.dataset.theme || localStorage.getItem("flash:theme") || "light";
    document.documentElement.dataset.theme = mode;
    try { localStorage.setItem("flash:theme", JSON.stringify(mode)); } catch {}
    // dispatch event for listeners
    document.dispatchEvent(new CustomEvent("flash:theme", { detail: mode }));
    return mode;
  }
  // auto-restore theme
  try {
    const saved = JSON.parse(localStorage.getItem("flash:theme") || "null");
    if (saved) document.documentElement.dataset.theme = saved;
  } catch {}

  /* ------------------------------- UI ------------------------------ */
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
      .flash-btn:active{opacity:.8}
      .flash-btn.primary{background:#111;color:#fff}
      .flash-btn.ghost{background:#eee;color:#111}
      .flash-loading{position:fixed;inset:0;background:rgba(255,255,255,.7);
        display:flex;align-items:center;justify-content:center;z-index:10001;backdrop-filter:blur(2px)}
      .flash-spinner{width:36px;height:36px;border:3px solid #ddd;border-top-color:#111;
        border-radius:50%;animation:flash-spin .8s linear infinite}
      @keyframes flash-fade{from{opacity:0}to{opacity:1}}
      @keyframes flash-spin{to{transform:rotate(360deg)}}
      [data-theme="dark"] .flash-modal{background:#1c1c1e;color:#f2f2f7}
      [data-theme="dark"] .flash-modal p{color:#a1a1aa}
      [data-theme="dark"] .flash-btn.ghost{background:#2c2c2e;color:#f2f2f7}
      [data-theme="dark"] .flash-loading{background:rgba(0,0,0,.6)}
      [data-theme="dark"] .flash-spinner{border-color:#333;border-top-color:#fff}
    `;
    document.head.appendChild(style);
  }

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
    injectStyles();
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
    injectStyles();
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

  /* ----------------------- Attach static API ----------------------- */
  F.http     = http;
  F.storage  = storage;
  F.copy     = copy;
  F.download = download;
  F.theme    = theme;
  F.toast    = toast;
  F.modal    = modal;
  F.alert    = alertBox;
  F.confirm  = confirmBox;
  F.loading  = loading;
  F.F        = F;
  F.Flash    = F;

  // jQuery compat alias — $.fn style not needed, but expose Flash global
  const Flash = F;
  Flash.version = VERSION;
  Flash.toast = toast;
  Flash.modal = modal;
  Flash.alert = alertBox;
  Flash.confirm = confirmBox;
  Flash.loading = loading;
  Flash.http = http;
  Flash.storage = storage;
  Flash.copy = copy;
  Flash.download = download;
  Flash.theme = theme;

  return Flash;
});
