# FLASH.js v1.0 — Çalışan Çekirdek + Proje Yapısı

Aşağıda **hemen kullanılabilir tek dosyalık `flash.js`**, **ESM-first modüler yapı**, `package.json`, TypeScript tanımları ve örnek kullanımlar var. Tek dosyalık sürüm `<script src>` ile çalışır; modüler sürüm tree-shaking için tasarlandı.

---

## 1) Proje yapısı

```text
flash.js/
├── package.json
├── README.md
├── flash.d.ts
├── dist/
│   ├── flash.js            # UMD/IIFE (CDN, <script>)
│   ├── flash.min.js
│   ├── index.js            # ESM ana giriş
│   ├── index.cjs
│   ├── dom.js
│   ├── http.js
│   ├── events.js
│   ├── animation.js
│   ├── storage.js
│   └── ui.js
└── src/
    ├── index.js
    ├── core/
    │   ├── collection.js
    │   └── utils.js
    ├── dom/
    │   ├── classes.js
    │   ├── attributes.js
    │   ├── content.js
    │   ├── css.js
    │   ├── manipulation.js
    │   └── traversal.js
    ├── events/index.js
    ├── http/index.js
    ├── animation/index.js
    ├── storage/index.js
    ├── observers/index.js
    ├── ui/
    │   ├── toast.js
    │   ├── modal.js
    │   └── loading.js
    └── utilities/
        ├── copy.js
        ├── download.js
        └── theme.js
```

---

## 2) `flash.js` — Tek dosya, çalışan çekirdek

```js
/*!
 * FLASH.js v1.0.0
 * jQuery, reimagined for the modern web.
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
  const isElement   = (v) => typeof Element !== "undefined" && v instanceof Element;
  const isCollection= (v) => v instanceof Collection;
  const isString    = (v) => typeof v === "string";
  const isFunction  = (v) => typeof v === "function";
  const isObject    = (v) => v !== null && typeof v === "object";

  const unique = (arr) => [...new Set(arr)];

  function toArray(value) {
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    if (value instanceof NodeList || value instanceof HTMLCollection) return [...value];
    if (value instanceof Collection) return value.elements;
    if (isElement(value) || value instanceof Document || value instanceof Window) return [value];
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
    eq(i)      { const el = this.elements[i]; return new Collection(el ? [el] : []); }

    /* Classes */
    addClass(...names) {
      const cls = names.flat().filter(Boolean);
      return this.each((_, el) => el.classList.add(...cls));
    }
    removeClass(...names) {
      const cls = names.flat().filter(Boolean);
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
      if (isObject(name)) {
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

    /* Data */
    data(key, value) {
      if (value === undefined && isString(key)) {
        const el = this.elements[0];
        if (!el) return undefined;
        const raw = el.dataset[key];
        return raw === undefined ? undefined : parseData(raw);
      }
      if (isObject(key)) {
        return this.each((_, el) =>
          Object.entries(key).forEach(([k, v]) => {
            el.dataset[k] = isString(v) ? v : JSON.stringify(v);
          })
        );
      }
      return this.each((_, el) => {
        el.dataset[key] = isString(value) ? value : JSON.stringify(value);
      });
    }

    /* CSS */
    css(prop, value) {
      if (isObject(prop)) return this.each((_, el) => Object.assign(el.style, prop));
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

    /* Events */
    on(events, selectorOrHandler, handlerOrOptions, options) {
      const eventList = events.split(/\s+/);
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
          el.__flashHandlers.push({ evt, wrapped, opts });
          el.addEventListener(evt, wrapped, opts);
        });
      });
    }
    off(events) {
      const eventList = events ? events.split(/\s+/) : null;
      return this.each((_, el) => {
        const handlers = el.__flashHandlers || [];
        handlers.forEach(({ evt, wrapped, opts }) => {
          if (!eventList || eventList.includes(evt)) {
            el.removeEventListener(evt, wrapped, opts);
          }
        });
        el.__flashHandlers = eventList
          ? handlers.filter((h) => !eventList.includes(h.evt))
          : [];
      });
    }
    one(events, handler) {
      const eventList = events.split(/\s+/);
      return this.each((_, el) => {
        eventList.forEach((evt) => {
          const wrap = (e) => {
            handler.call(el, e);
            el.removeEventListener(evt, wrap);
          };
          el.addEventListener(evt, wrap);
        });
      });
    }
    trigger(event, detail) {
      const e = isString(event)
        ? new CustomEvent(event, { detail, bubbles: true, cancelable: true })
        : event;
      return this.each((_, el) => el.dispatchEvent(e));
    }

    /* Effects — Web Animations API */
    async animate(keyframes, options = {}) {
      const opts = typeof options === "number" ? { duration: options } : options;
      const animations = this.elements.map((el) =>
        el.animate(keyframes, {
          duration: 300,
          easing: "ease",
          fill: "forwards",
          ...opts,
        })
      );
      await Promise.all(animations.map((a) => a.finished));
      return this;
    }
    async fadeIn(duration = 300) {
      this.show();
      return this.animate({ opacity: [0, 1] }, { duration });
    }
    async fadeOut(duration = 300) {
      await this.animate({ opacity: [1, 0] }, { duration });
      return this.hide();
    }

    /* Observers */
    observe(callback, options = {}) {
      const observer = new MutationObserver(callback);
      this.each((_, el) =>
        observer.observe(el, { childList: true, subtree: true, attributes: true, ...options })
      );
      return this;
    }
    visible(callback, options = {}) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => callback(entry.isIntersecting, entry));
      }, options);
      this.each((_, el) => observer.observe(el));
      return this;
    }
    resize(callback, options = {}) {
      const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => callback(entry.contentRect, entry));
      });
      this.each((_, el) => observer.observe(el, options));
      return this;
    }
  }

  /* ------------------------------- F() ----------------------------- */
  function F(target) {
    if (target instanceof Collection) return target;
    if (isFunction(target)) return F.ready(target);

    if (isString(target)) {
      const trimmed = target.trim();
      if (trimmed.startsWith("<")) {
        const tpl = document.createElement("template");
        tpl.innerHTML = trimmed;
        return new Collection([...tpl.content.children]);
      }
      return new Collection([...document.querySelectorAll(trimmed)]);
    }

    if (
      target instanceof Window ||
      target instanceof Document ||
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
  F.extend = (target, ...sources) => Object.assign(target, ...sources);

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
        if (!finalHeaders["Content-Type"]) finalHeaders["Content-Type"] = "application/json";
      }

      try {
        const res = await fetch(url, {
          ...rest,
          body: payload,
          headers: finalHeaders,
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
        return res;
      } finally {
        if (timer) clearTimeout(timer);
      }
    },
    async json(url, options) { return (await http.request(url, options)).json(); },
    async text(url, options) { return (await http.request(url, options)).text(); },
    async blob(url, options) { return (await http.request(url, options)).blob(); },
    get(url, options = {})       { return http.request(url, { ...options, method: "GET" }); },
    post(url, body, options = {}){ return http.request(url, { ...options, method: "POST", body }); },
    put(url, body, options = {}) { return http.request(url, { ...options, method: "PUT", body }); },
    patch(url, body, options = {}){ return http.request(url, { ...options, method: "PATCH", body }); },
    delete(url, options = {})    { return http.request(url, { ...options, method: "DELETE" }); },
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
      document.execCommand("copy");
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
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function theme(mode) {
    if (!mode) return document.documentElement.dataset.theme || "light";
    document.documentElement.dataset.theme = mode;
    storage.set("flash:theme", mode);
    return mode;
  }

  /* ------------------------------- UI ------------------------------ */
  const STYLE_ID = "flash-styles";
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .flash-toast-container{position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;pointer-events:none}
      .flash-toast{background:#111;color:#fff;padding:.75rem 1rem;border-radius:.5rem;
        font:14px/1.4 system-ui,-apple-system,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.2);
        animation:flash-in .2s ease;pointer-events:auto;max-width:320px}
      .flash-toast.success{background:#0a7a3b}
      .flash-toast.error{background:#b00020}
      .flash-toast.warn{background:#a35c00}
      @keyframes flash-in{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
      .flash-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);display:flex;
        align-items:center;justify-content:center;z-index:10000;animation:flash-fade .15s ease}
      .flash-modal{background:#fff;color:#111;border-radius:.75rem;padding:1.25rem 1.5rem;
        min-width:280px;max-width:90vw;box-shadow:0 20px 60px rgba(0,0,0,.3);
        font:14px/1.5 system-ui,-apple-system,sans-serif}
      .flash-modal h3{margin:0 0 .5rem;font-size:1rem}
      .flash-modal p{margin:0 0 1rem;color:#444}
      .flash-modal-actions{display:flex;gap:.5rem;justify-content:flex-end}
      .flash-btn{border:0;border-radius:.4rem;padding:.5rem .9rem;font:inherit;cursor:pointer}
      .flash-btn.primary{background:#111;color:#fff}
      .flash-btn.ghost{background:#eee;color:#111}
      .flash-loading{position:fixed;inset:0;background:rgba(255,255,255,.7);
        display:flex;align-items:center;justify-content:center;z-index:10001}
      .flash-spinner{width:36px;height:36px;border:3px solid #ddd;border-top-color:#111;
        border-radius:50%;animation:flash-spin .8s linear infinite}
      @keyframes flash-fade{from{opacity:0}to{opacity:1}}
      @keyframes flash-spin{to{transform:rotate(360deg)}}
      [data-theme="dark"] .flash-modal{background:#1c1c1e;color:#f2f2f7}
      [data-theme="dark"] .flash-modal p{color:#a1a1aa}
      [data-theme="dark"] .flash-btn.ghost{background:#2c2c2e;color:#f2f2f7}
      [data-theme="dark"] .flash-loading{background:rgba(0,0,0,.6)}
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
      document.body.appendChild(container);
    }
    const el = document.createElement("div");
    el.className = `flash-toast ${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.transition = "opacity .2s, transform .2s";
      el.style.opacity = "0";
      el.style.transform = "translateX(10px)";
      setTimeout(() => el.remove(), 200);
    }, duration);
    return el;
  }

  function modal({ title, message, actions }) {
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
      actions.forEach((action, i) => {
        const btn = document.createElement("button");
        btn.className = `flash-btn ${action.variant || (i === actions.length - 1 ? "primary" : "ghost")}`;
        btn.textContent = action.label;
        btn.onclick = () => { backdrop.remove(); resolve(action.value); };
        actionsEl.appendChild(btn);
      });
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) { backdrop.remove(); resolve(null); }
      });
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
  function loading(show = true) {
    injectStyles();
    if (show) {
      if (loadingEl) return;
      loadingEl = document.createElement("div");
      loadingEl.className = "flash-loading";
      loadingEl.innerHTML = '<div class="flash-spinner"></div>';
      document.body.appendChild(loadingEl);
    } else {
      loadingEl?.remove();
      loadingEl = null;
    }
  }

  /* ----------------------- Attach static API ----------------------- */
  F.http     = http;
  F.storage  = storage;
  F.copy     = copy;
  F.download = download;
  F.theme    = theme;
  F.toast    = toast;
  F.alert    = alertBox;
  F.confirm  = confirmBox;
  F.loading  = loading;
  F.F        = F;

  return F;
});
```

---

## 3) `package.json`

```json
{
  "name": "flash.js",
  "version": "1.0.0",
  "description": "jQuery, reimagined for the modern web. Zero-dependency, tree-shakable DOM & Web API library.",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./flash.d.ts",
  "unpkg": "./dist/flash.min.js",
  "jsdelivr": "./dist/flash.min.js",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./flash.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./dom":       { "import": "./dist/dom.js" },
    "./http":      { "import": "./dist/http.js" },
    "./events":    { "import": "./dist/events.js" },
    "./animation": { "import": "./dist/animation.js" },
    "./storage":   { "import": "./dist/storage.js" },
    "./ui":        { "import": "./dist/ui.js" }
  },
  "files": ["dist", "src", "flash.d.ts", "README.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest run"
  },
  "keywords": ["dom", "jquery", "vanilla", "tree-shakable", "esm", "web-api", "flash"],
  "license": "MIT"
}
```

---

## 4) TypeScript tanımları — `flash.d.ts`

```ts
export type FlashTarget =
  | string
  | Element
  | Document
  | Window
  | NodeList
  | Element[]
  | FlashCollection
  | (() => void);

export interface FlashOptions {
  duration?: number;
  easing?: string;
  [key: string]: unknown;
}

export interface HttpOptions extends RequestInit {
  json?: unknown;
  timeout?: number;
}

export class FlashCollection {
  readonly length: number;
  [index: number]: Element;
  [Symbol.iterator](): Iterator<Element>;

  get(index?: number): Element | Element[] | undefined;

  each(fn: (this: Element, i: number, el: Element) => void): this;
  map<T>(fn: (this: Element, i: number, el: Element) => T): T[];
  filter(fn: (this: Element, i: number, el: Element) => boolean): FlashCollection;

  first(): FlashCollection;
  last(): FlashCollection;
  eq(i: number): FlashCollection;

  addClass(...names: (string | string[])[]): this;
  removeClass(...names: (string | string[])[]): this;
  toggleClass(name: string, force?: boolean): this;
  hasClass(name: string): boolean;

  attr(name: string | Record<string, string>, value?: string | null): this | string | null;
  removeAttr(...names: (string | string[])[]): this;
  prop(name: string, value?: unknown): this | unknown;

  data(key: string | Record<string, unknown>, value?: unknown): this | unknown;

  css(prop: string | Record<string, string>, value?: string): this | string | undefined;

  html(value?: string | FlashCollection | Element): this | string;
  text(value?: string): this | string;
  val(value?: string): this | string | undefined;

  show(display?: string): this;
  hide(): this;
  toggle(display?: string): this;

  append(content: string | Element | FlashCollection | (string | Element)[]): this;
  prepend(content: string | Element | FlashCollection | (string | Element)[]): this;
  before(content: string | Element | FlashCollection | (string | Element)[]): this;
  after(content: string | Element | FlashCollection | (string | Element)[]): this;
  remove(): this;
  empty(): this;

  find(selector: string): FlashCollection;
  parent(): FlashCollection;
  parents(selector?: string): FlashCollection;
  children(selector?: string): FlashCollection;
  closest(selector: string): FlashCollection;
  siblings(selector?: string): FlashCollection;
  next(selector?: string): FlashCollection;
  prev(selector?: string): FlashCollection;
  is(selector: string): boolean;

  on(events: string, handler: (e: Event) => void, options?: AddEventListenerOptions): this;
  on(events: string, selector: string, handler: (e: Event, target: Element) => void, options?: AddEventListenerOptions): this;
  off(events?: string): this;
  one(events: string, handler: (e: Event) => void): this;
  trigger(event: string | Event, detail?: unknown): this;

  animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | FlashOptions): Promise<this>;
  fadeIn(duration?: number): Promise<this>;
  fadeOut(duration?: number): Promise<this>;

  observe(cb: MutationCallback, options?: MutationObserverInit): this;
  visible(cb: (isVisible: boolean, entry: IntersectionObserverEntry) => void, options?: IntersectionObserverInit): this;
  resize(cb: (rect: DOMRectReadOnly, entry: ResizeObserverEntry) => void, options?: ResizeObserverOptions): this;
}

export interface FlashStatic {
  <T extends FlashTarget>(target: T): FlashCollection;
  version: string;
  Collection: typeof FlashCollection;
  ready(cb: (F: FlashStatic) => void): FlashStatic;
  each<T>(obj: T, fn: (this: unknown, k: unknown, v: unknown) => void): T;
  map<T, U>(arr: Iterable<T>, fn: (v: T, i: number) => U): U[];
  extend<T extends object>(target: T, ...sources: object[]): T;

  http: {
    request(url: string, options?: HttpOptions): Promise<Response>;
    json<T = unknown>(url: string, options?: HttpOptions): Promise<T>;
    text(url: string, options?: HttpOptions): Promise<string>;
    blob(url: string, options?: HttpOptions): Promise<Blob>;
    get(url: string, options?: HttpOptions): Promise<Response>;
    post(url: string, body?: BodyInit, options?: HttpOptions): Promise<Response>;
    put(url: string, body?: BodyInit, options?: HttpOptions): Promise<Response>;
    patch(url: string, body?: BodyInit, options?: HttpOptions): Promise<Response>;
    delete(url: string, options?: HttpOptions): Promise<Response>;
  };

  storage: {
    get<T = unknown>(key: string, fallback?: T): T;
    set<T>(key: string, value: T): T;
    remove(key: string): void;
    clear(): void;
    has(key: string): boolean;
  };

  copy(text: string): Promise<true>;
  download(filename: string, data: Blob | string | ArrayBuffer, mime?: string): void;
  theme(mode?: "light" | "dark"): string;

  toast(message: string, options?: string | { type?: "info" | "success" | "error" | "warn"; duration?: number }): HTMLElement;
  alert(message: string, title?: string): Promise<true>;
  confirm(message: string, title?: string): Promise<boolean | null>;
  loading(show?: boolean): void;

  F: FlashStatic;
}

declare const F: FlashStatic;
export const Flash: FlashStatic;
export { F };
export default F;
```

---

## 5) Kullanım örnekleri

### CDN / script etiketi

```html
<script src="flash.js"></script>
<script>
  F.ready(() => {
    F(".button")
      .addClass("active")
      .on("click", () => F.toast("Tıklandı!", "success"));
  });
</script>
```

### jQuery'den geçiş

```js
// jQuery
$(".card").addClass("active").on("click", handler);

// FLASH.js
F(".card").addClass("active").on("click", handler);
```

### HTTP + async/await

```js
const user = await F.http.json("/api/user/42");

await F.http.post("/api/user", { name: "Ada" }, { json: true });

const res = await F.http.get("/api/data", { timeout: 5000 });
```

### UI

```js
F.toast("Kaydedildi", "success");

if (await F.confirm("Silmek istediğine emin misin?")) {
  console.log("Silindi");
}

F.loading(true);
await doSomething();
F.loading(false);
```

### Storage + Theme

```js
F.storage.set("theme", "dark");
F.theme("dark");           // <html data-theme="dark">
F.theme();                 // "dark"
```

### Observers + Animasyon

```js
F("#image").visible((isVisible) => {
  if (isVisible) F("#image").fadeIn();
});

await F("#box").animate(
  { opacity: [1, 0], transform: ["translateY(0)", "translateY(20px)"] },
  { duration: 200 }
);
```

---

## 6) Modüler ESM kullanımı (tree-shaking)

`src/index.js` (özet):

```js
export { Collection } from "./core/collection.js";
export { default as F } from "./core/F.js";
export { http } from "./http/index.js";
export { storage } from "./storage/index.js";
export { toast, alertBox as alert, confirmBox as confirm, loading } from "./ui/index.js";
export { copy } from "./utilities/copy.js";
export { download } from "./utilities/download.js";
export { theme } from "./utilities/theme.js";
```

Kullanıcı:

```js
// Tüm kütüphane değil, sadece ihtiyaç duyduğu parçalar bundle'a girer
import { F } from "flash.js";
import { http } from "flash.js/http";
import { toast } from "flash.js/ui";

F(".btn").on("click", async () => {
  const data = await http.json("/api");
  toast("Yüklendi", "success");
});
```

---

## 7) Sonraki adımlar

1. **`src/` klasörünü** yukarıdaki yapıya göre böl (şu an tek dosyada tüm mantık var — modüler sürüm için method'ları ayrı dosyalara taşıyıp `Collection.prototype`'a mixin olarak ekle).
2. **Rollup config** ile `dist/flash.js`, `dist/index.js`, `dist/dom.js` vb. üret.
3. **Minify** (terser) + **gzip/brotli** çıktısı: hedef ~6–8 KB.
4. **Vitest** ile testler.
5. **`npx flash analyze`** CLI'ı — Rollup metafile'ı okuyup hangi modüllerin kullanıldığını raporlar.

Bu haliyle `flash.js` tek dosya olarak **hemen tarayıcıda çalışır**; proje yapısı ise `src/` altına bölündüğünde **tree-shakable, ESM-first, sıfır bağımlılıklı** bir kütüphaneye dönüşür. İstersen sıradaki adım olarak **`src/` modüler sürümünü** (her modül ayrı dosya + `Collection` prototype mixinleri) ve **`rollup.config.js`**'i de yazabilirim.