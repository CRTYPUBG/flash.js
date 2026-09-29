import terser from "@rollup/plugin-terser";

const entries = {
  "index": "src/index.js",
  "dom": "src/dom.js",
  "http": "src/http.js",
  "events": "src/events.js",
  "animation": "src/animation.js",
  "storage": "src/storage.js",
  "ui": "src/ui.js",
  "observers": "src/observers.js",
  "utils": "src/utils.js",
};

const esmBuilds = Object.entries(entries).map(([name, input]) => ({
  input,
  output: {
    file: `dist/${name}.js`,
    format: "esm",
  },
}));

// CJS for main entry
const cjsBuild = {
  input: "src/index.js",
  output: {
    file: "dist/index.cjs",
    format: "cjs",
    exports: "named",
  },
};

// UMD for CDN — src/umd.js assigns the F function itself to the
// `Flash` and `F` globals (same shape as root flash.js), so
// `Flash.version`, `F.toast(...)` etc. work from a plain <script> tag.
const umdBuild = {
  input: "src/umd.js",
  output: {
    file: "dist/flash.min.js",
    format: "umd",
    name: "Flash",
    exports: "default",
  },
  plugins: [terser()],
};

const umdUnminified = {
  input: "src/umd.js",
  output: {
    file: "dist/flash.js",
    format: "umd",
    name: "Flash",
    exports: "default",
  },
};

export default [...esmBuilds, cjsBuild, umdBuild, umdUnminified];
