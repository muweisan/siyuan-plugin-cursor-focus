const typescript = require("@rollup/plugin-typescript");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { readFileSync } = require("fs");

/**
 * 将 CSS 文件转换为"运行时向页面注入 <style>"的 JS 模块。
 * 思源插件通过 index.js 加载，无法单独引用样式文件，
 * 因此把 styles.css 打包进 JS，在插件加载时注入页面。
 */
function cssInject() {
  return {
    name: "css-inject",
    load(id) {
      if (id.endsWith(".css")) {
        const code = readFileSync(id, "utf8");
        return (
          `const style = document.createElement("style");\n` +
          `style.textContent = ${JSON.stringify(code)};\n` +
          `document.head.appendChild(style);\n` +
          `export default style;`
        );
      }
    },
  };
}

module.exports = {
  input: "src/index.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    exports: "default",
  },
  plugins: [
    cssInject(),
    resolve(),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
    }),
  ],
  external: ["siyuan"],
};
