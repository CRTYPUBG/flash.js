````md
# Flash.js Skill

## Purpose

Use Flash.js to create lightweight DOM interactions, event handlers,
toast notifications, alerts and UI utilities in browser applications.

## CDN

Use the versioned CDN URL:

https://unpkg.com/@flash-js/flash.js@1.0.0/dist/flash.min.js

```html
<script src="https://unpkg.com/@flash-js/flash.js@1.0.0/dist/flash.min.js"></script>
````

## Global API

Flash.js exposes its API through:

```js
Flash
```

The main DOM helper is:

```js
Flash.F
```

Do NOT assume that `F` is automatically available globally.

This is incorrect:

```js
F.ready(() => {});
```

Use:

```js
Flash.F.ready(() => {});
```

Or create a local alias:

```js
const F = Flash.F;

F.ready(() => {});
```

## Recommended Usage

```html
<script src="https://unpkg.com/@flash-js/flash.js@1.0.0/dist/flash.min.js"></script>

<script>
  const F = Flash.F;

  F.ready(() => {
    F(".button").on("click", () => {
      F.toast("Hello!", "success");
    });
  });
</script>
```

## DOM Selection

Use:

```js
F(".button")
```

Example:

```js
const F = Flash.F;

F(".button").on("click", () => {
  F.toast("Button clicked!", "success");
});
```

## Ready

Run code after the DOM is ready:

```js
F.ready(() => {
  // application code
});
```

## Events

Attach events with:

```js
F(".button").on("click", handler);
```

Example:

```js
F("#save").on("click", () => {
  F.toast("Saved successfully!", "success");
});
```

## Toast

Display a toast:

```js
F.toast("Hello!", "success");
```

Common notification types:

```js
F.toast("Operation completed.", "success");
F.toast("Something went wrong.", "error");
F.toast("Be careful.", "warning");
F.toast("Information message.", "info");
```

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Flash.js Example</title>
</head>

<body>

  <button class="button">
    Show Toast
  </button>

  <script src="https://unpkg.com/@flash-js/flash.js@1.0.0/dist/flash.min.js"></script>

  <script>
    const F = Flash.F;

    F.ready(() => {
      F(".button").on("click", () => {
        F.toast("Hello!", "success");
      });
    });
  </script>

</body>
</html>
```

## Important

Always load Flash.js before using `Flash.F`.

Correct:

```html
<script src="https://unpkg.com/@flash-js/flash.js@1.0.0/dist/flash.min.js"></script>

<script>
  const F = Flash.F;
</script>
```

Incorrect:

```html
<script>
  F.toast("Hello!", "success");
</script>

<script src="https://unpkg.com/@flash-js/flash.js@1.0.0/dist/flash.min.js"></script>
```

## Global F Compatibility

If an application specifically wants the short `F` syntax:

```js
const F = Flash.F;
```

Then:

```js
F.ready(() => {
  F(".button").on("click", () => {
    F.toast("Hello!", "success");
  });
});
```

Do not expect `window.F` to exist automatically.

## Debugging

If:

```js
F is not defined
```

check:

```js
console.log(window.F);
console.log(window.Flash);
console.log(Flash.F);
```

Expected:

```text
window.F      -> undefined
window.Flash  -> Flash object
Flash.F       -> function
```

Therefore use:

```js
const F = Flash.F;
```

## Rule

When generating Flash.js code:

1. Load the versioned CDN.
2. Access the API through `Flash.F`.
3. Prefer `const F = Flash.F`.
4. Call `F.ready()` after loading the library.
5. Use `F(selector)` for DOM operations.
6. Use `.on()` for events.
7. Use `F.toast()` for notifications.
8. Never assume `window.F` exists.

````