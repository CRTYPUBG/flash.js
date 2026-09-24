# FLASH.js API — chat-log + deepseek + BetaWeb tabanlı

Bu doküman `chat-log.md` ve `deepseek.md` tasarımlarının birleştirilmiş API referansıdır. BetaWeb eski sürümü (`betaWeb-flashjs.old`) sadece flash-message odaklıydı; yeni tasarım tüm jQuery DX'i modern Web API'leri ile yeniden kurar.

## F() — Seçici

```js
F(".card")            // Collection
F("<div>hello</div>") // HTML string → element oluşturur
F(element)            // wrap
F([el1, el2])         // array / NodeList
F(() => console.log("ready")) // F.ready sugar
```

## Collection (chainable)

```js
F(".card").addClass("active").attr("data-ready","true").on("click", handler)
```

### Sınıflar
`addClass(...names)` `removeClass(...names)` `toggleClass(name, force)` `hasClass(name)`

### Attributes / Props / Data
`attr(name, value)` `removeAttr(...names)` `prop(name, value)` `removeProp(name)` `data(key, value)` `removeData(key)` — `data` JSON auto parse/stringify, `dataset` üzerinden çalışır.

### CSS / İçerik
`css(prop, value)` `html(value)` `text(value)` `val(value)` `show(display?)` `hide()` `toggle(display?)`

### Manipülasyon
`append(content)` `prepend(content)` `before(content)` `after(content)` `remove()` `empty()` `clone(deep?)`

### Traversal
`find(selector)` `parent()` `parents(selector?)` `children(selector?)` `closest(selector)` `siblings(selector?)` `next(selector?)` `prev(selector?)` `is(selector)` `index(selector?)`

### Koleksiyon yardımcıları
`get(index?)` `each(fn)` `map(fn)` `filter(fn)` `first()` `last()` `eq(i)`

## Events

```js
F("button").on("click", handler)
F("button").off("click", handler)
F("button").one("click", handler)
F("button").trigger("custom:event", { detail: 123 })
F(document).on("click", ".btn", (e, target) => {})
```

## Effects (Web Animations API)

```js
await F("#box").animate({ opacity: [0,1] }, { duration: 300 })
await F("#box").fadeIn(300)
await F("#box").fadeOut(300)
await F("#box").slideDown(300)
await F("#box").slideUp(300)
```

## Observers

```js
F("#app").observe((mutations) => {}, { attributes: true })
F("#image").visible((isVisible, entry) => {}, { threshold: 0.5 })
F("#panel").resize((rect, entry) => {}, {})
```

## HTTP — `F.http`

`fetch` + `AbortController` + timeout sarmalayıcısı.

```js
const res  = await F.http.get("/api/user", { timeout: 5000 })
const data = await F.http.json("/api/user/42")
const txt  = await F.http.text("/api")
const blob = await F.http.blob("/api/file")
await F.http.post("/api/user", JSON.stringify({name:"Ada"}), { headers:{...} })
await F.http.request("/api", { method:"POST", json: {name:"Ada"}, timeout: 3000 })

// json sugar:
await F.http.request("/api", { method:"POST", json: {name:"Ada"} })
```

Hata durumunda `throw Error("HTTP 404 ...")` ve `error.status`, `error.response` erişilebilir.

## Storage — `F.storage`

```js
F.storage.set("theme","dark")
F.storage.get("theme")          // JSON parse otomatik
F.storage.has("theme")
F.storage.remove("theme")
F.storage.clear()
F.storage.session.get("key")    // sessionStorage varyantı
```

## Utilities

```js
F.ready(() => {})
F.each(obj, fn)
F.map(arr, fn)
F.filter(arr, fn)
F.extend(target, ...sources)
F.unique(arr)
F.toArray(value)
F.type(value)    // "array" | "null" | typeof
F.isEmpty(value)
await F.copy("CRTY DEV")              // clipboard + fallback
F.download("file.txt", "hello", "text/plain")
F.theme("dark") // <html data-theme="dark"> + localStorage + event flash:theme
F.theme()       // "dark" | "light"
```

## UI — `F.toast / F.alert / F.confirm / F.loading`

```js
F.toast("Kaydedildi", "success") // "info" | "success" | "error" | "warn" | "warning"
F.toast("Kaydedildi", { type:"success", duration: 3000 })

await F.alert("Bir hata oluştu", "Hata") // Promise<true|null>
const ok = await F.confirm("Silinsin mi?", "Onay") // Promise<boolean|null>

F.loading(true)  // reference-counted — çoklu çağrı güvenli
F.loading(false)
```

CSS otomatik inject edilir (`#flash-styles`), dark theme ` [data-theme="dark"]` ile uyumlu.

## ESM / Tree-shaking

```js
import { F } from "flash.js"          // ana giriş
import { http } from "flash.js/http"  // sadece http bundle'a girer
import { toast } from "flash.js/ui"
import { storage } from "flash.js/storage"
```

`package.json` → `"sideEffects": false`, `exports` subpath'leri, Rollup/Vite/esbuild tree-shaking ile kullanılmayan modüller çıkarılır.

## CDN

```html
<script src="flash.js"></script>
<script>
  F.toast("hello")
  Flash === F // true
</script>
```

## BetaWeb'den geçiş

Eski: `new FlashMessage("msg","success")`, `new Flash(".flash-message")`
Yeni: `F.toast(...)`, `F(".flash-message")` — eski sınıf isimleri korunmuyor, ama `Flash` globali `F`'ye alias olarak duruyor.
