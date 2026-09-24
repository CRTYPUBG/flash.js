# FLASH.js — jQuery, reimagined for the modern web.

> **Fast Lightweight UI / HTML System** — familiar jQuery DX, modern Web APIs, zero dependencies, tree-shakable.

```
npm install flash.js
```

```js
import { F } from "flash.js";

F(".card").addClass("active").on("click", () => F.toast("FLASH!"));
const user = await F.http.json("/api/user/42");
```

CDN:
```html
<script src="https://unpkg.com/flash.js/dist/flash.min.js"></script>
<script>
  F(".button").on("click", () => F.toast("Kaydedildi!", "success"));
</script>
```

## Özellikler

- `F(selector)` — `querySelectorAll` tabanlı chainable Collection
- DOM: `html/text/val`, `addClass/removeClass/toggleClass/hasClass`, `attr/prop/data`, `css`, `show/hide/toggle`, `append/prepend/before/after/remove/empty`
- Traversal: `find/parent/parents/children/closest/siblings/next/prev/is`
- Events: `on/off/one/trigger` + delegation `F(document).on("click", ".btn", handler)`
- Effects: `animate/fadeIn/fadeOut` → Web Animations API
- Observers: `observe/visible/resize` → Mutation / Intersection / Resize Observer
- HTTP: `F.http.get/post/put/patch/delete/json/text/blob` → `fetch` + `AbortController` + timeout
- Storage: `F.storage.get/set/has/remove/clear` → `localStorage` JSON wrapper
- UI: `F.toast / F.alert / F.confirm / F.loading` — sıfır bağımlılık, injected CSS
- Utilities: `F.copy`, `F.download`, `F.theme`, `F.ready`, `F.each/map/extend`
- ESM-first, `sideEffects: false`, subpath exports → tam tree-shaking
- Tek dosya UMD: `flash.js` / `flash.min.js` (≈6–8 KB gzip hedefi)

## Proje Yapısı

```
flash.js/
├── flash.js          # UMD/CDN tek dosya (deepseek çekirdeği)
├── flash.d.ts        # TypeScript tanımları
├── package.json
├── rollup.config.js
├── src/
│   ├── index.js
│   ├── core/{collection.js, utils.js}
│   ├── dom/
│   ├── events/
│   ├── http/
│   ├── animation/
│   ├── storage/
│   ├── observers/
│   ├── ui/{toast.js, modal.js, loading.js}
│   └── utilities/{copy.js, download.js, theme.js}
├── dist/             # build çıktısı
├── example/index.html
└── betaWeb-flashjs.old/  # eski BetaWeb referans implementasyonu (arşiv)
```

## Hızlı Başlangıç

```bash
npm install
npm run build   # rollup → dist/
npm run dev     # watch mode
```

## API Özet

```js
F("#app").html("<h1>Hello</h1>").addClass("ready");
F("button").on("click", e => console.log(e));
F(document).on("click", ".btn", handler); // delegation
await F("#box").animate({ opacity: [0,1] }, { duration: 300 });
F.storage.set("theme", "dark"); F.theme("dark");
await F.copy("CRTY DEV"); F.download("hello.txt", "Hello");
F.toast("Kaydedildi", "success");
if (await F.confirm("Silinsin mi?")) { /* ... */ }
F.loading(true); await doWork(); F.loading(false);
```

Subpath (tree-shaking dostu):
```js
import { http } from "flash.js/http";
import { toast } from "flash.js/ui";
```

## Kaynak

- `chat-log.md` → ürün vizyonu, API tasarımı, slogan/hikâye
- `deepseek.md` → çalışan çekirdek + modüler yapı + package.json/d.ts
- `betaWeb-flashjs.old/` → eski Flash/FlashMessage sınıfı (referans, lodash+jQuery bağımlı)

MIT License.
