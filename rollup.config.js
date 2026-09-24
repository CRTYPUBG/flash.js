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

// UMD / IIFE for CDN — uses root flash.js source via src/index fallback but provide global F/Flash
const umdBuild = {
  input: "src/index.js",
  output: {
    file: "dist/flash.min.js",
    format: "umd",
    name: "Flash",
    exports: "named",
  },
  plugins: [terser()],
};

const umdUnminified = {
  input: "src/index.js",
  output: {
    file: "dist/flash.js",
    format: "umd",
    name: "Flash",
    exports: "named",
  },
};

export default [...esmBuilds, cjsBuild, umdBuild, umdUnminified];
