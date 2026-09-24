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
  removeProp(name: string): this;

  data(key: string | Record<string, unknown>, value?: unknown): this | unknown;
  removeData(key: string): this;

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
  clone(deep?: boolean): FlashCollection;

  find(selector: string): FlashCollection;
  parent(): FlashCollection;
  parents(selector?: string): FlashCollection;
  children(selector?: string): FlashCollection;
  closest(selector: string): FlashCollection;
  siblings(selector?: string): FlashCollection;
  next(selector?: string): FlashCollection;
  prev(selector?: string): FlashCollection;
  is(selector: string): boolean;
  index(selector?: string): number;

  on(events: string, handler: (e: Event) => void, options?: AddEventListenerOptions): this;
  on(events: string, selector: string, handler: (e: Event, target: Element) => void, options?: AddEventListenerOptions): this;
  off(events?: string, handler?: (e: Event) => void): this;
  one(events: string, handler: (e: Event) => void): this;
  trigger(event: string | Event, detail?: unknown): this;

  animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options?: number | KeyframeAnimationOptions): Promise<this>;
  fadeIn(duration?: number): Promise<this>;
  fadeOut(duration?: number): Promise<this>;
  slideDown(duration?: number): Promise<this>;
  slideUp(duration?: number): Promise<this>;

  observe(cb: MutationCallback, options?: MutationObserverInit): MutationObserver;
  visible(cb: (isVisible: boolean, entry: IntersectionObserverEntry) => void, options?: IntersectionObserverInit): IntersectionObserver;
  resize(cb: (rect: DOMRectReadOnly, entry: ResizeObserverEntry) => void, options?: ResizeObserverOptions): ResizeObserver;
}

export interface FlashStatic {
  (target: FlashTarget): FlashCollection;
  version: string;
  Collection: typeof FlashCollection;
  ready(cb: (F: FlashStatic) => void): FlashStatic;
  each<T>(obj: T, fn: (this: unknown, k: unknown, v: unknown) => void): T;
  map<T, U>(arr: Iterable<T>, fn: (v: T, i: number) => U): U[];
  filter<T>(arr: Iterable<T>, fn: (v: T, i: number) => boolean): T[];
  extend<T extends object>(target: T, ...sources: object[]): T;
  unique<T>(arr: T[]): T[];
  toArray(value: unknown): Element[];
  type(v: unknown): string;
  isEmpty(v: unknown): boolean;

  http: {
    request(url: string, options?: HttpOptions): Promise<Response>;
    json<T = unknown>(url: string, options?: HttpOptions): Promise<T>;
    text(url: string, options?: HttpOptions): Promise<string>;
    blob(url: string, options?: HttpOptions): Promise<Blob>;
    arrayBuffer(url: string, options?: HttpOptions): Promise<ArrayBuffer>;
    get(url: string, options?: HttpOptions): Promise<Response>;
    post(url: string, body?: BodyInit | null, options?: HttpOptions): Promise<Response>;
    put(url: string, body?: BodyInit | null, options?: HttpOptions): Promise<Response>;
    patch(url: string, body?: BodyInit | null, options?: HttpOptions): Promise<Response>;
    delete(url: string, options?: HttpOptions): Promise<Response>;
  };

  storage: {
    get<T = unknown>(key: string, fallback?: T): T;
    set<T>(key: string, value: T): T;
    remove(key: string): void;
    clear(): void;
    has(key: string): boolean;
    session: {
      get<T = unknown>(key: string, fallback?: T): T;
      set<T>(key: string, value: T): T;
      remove(key: string): void;
      clear(): void;
      has(key: string): boolean;
    };
  };

  copy(text: string): Promise<true>;
  download(filename: string, data: Blob | string | ArrayBuffer, mime?: string): void;
  theme(mode?: "light" | "dark" | "system"): string;

  toast(message: string, options?: string | { type?: "info" | "success" | "error" | "warn" | "warning"; duration?: number }): HTMLElement;
  modal(options: { title?: string; message?: string; actions: { label: string; value: unknown; variant?: "primary" | "ghost" }[]; closeOnBackdrop?: boolean }): Promise<unknown>;
  alert(message: string, title?: string): Promise<true | null>;
  confirm(message: string, title?: string): Promise<boolean | null>;
  loading(show?: boolean): void;

  F: FlashStatic;
  Flash: FlashStatic;
}

declare const F: FlashStatic;
export const Flash: FlashStatic;
export { F };
export const VERSION: string;
export default F;
