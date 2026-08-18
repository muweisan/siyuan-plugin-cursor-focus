[中文](https://github.com/muweisan/siyuan-plugin-cursor-focus/blob/main/README.zh-CN.md)

# Cursor Focus

A SiYuan Note plugin: **auto-scroll to the cursor block and highlight it when switching documents**, based on the official [plugin-sample](https://github.com/siyuan-note/plugin-sample) project structure.

## Features

* **Auto focus on document switch**: scrolls to the block where the cursor was last placed in that document
* **Highlight**: the located block flashes briefly; duration configurable (500–5000 ms, default 2000 ms)
* **Manual focus**: a top-bar button to locate the current cursor block at any time
* **i18n**: UI texts switch between Chinese and English automatically

## Getting started

* Clone this repository into your local development folder. For convenience, you can place the development folder directly under `{workspace}/data/plugins/`
* Install [NodeJS](https://nodejs.org/en/download) and [pnpm](https://pnpm.io/installation) (or npm), then run `pnpm i` (or `npm i`) in the development folder
* Run `pnpm run dev` (or `npm run dev`) for live compilation
* Open the Bazaar in SiYuan and enable the plugin in the Download tab

## Settings

After the plugin is enabled, open the plugin's settings page in the Bazaar to configure:

* **Auto focus when switching documents**: whether to locate the cursor block automatically on document switch (default on)
* **Highlight duration (ms)**: duration of the highlight animation, 500–5000 ms (default 2000 ms)

## Development

* `src/index.ts`: plugin entry
* `src/cursor.ts`: cursor focus core logic
* `src/index.scss`: styles (built into `index.css`)
* `src/i18n/*.json`: language files
* `icon.png` (160*160), `preview.png` (1024*768)
* [Frontend API](https://github.com/siyuan-note/petal)
* [Backend API](https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md)

### Implementation notes

1. Listens to the official SiYuan `switch-protyle` event only (covers both tab switching and opening documents). A MutationObserver fallback is intentionally NOT used: it reacts to every class change in the layout — including the plugin's own highlight class — which caused the view to jump back to the cursor block repeatedly
2. SiYuan loses the selection when switching away from a document, so the plugin continuously records the last cursor block of each document and restores the position when switching back
3. Settings are stored with `loadData`/`saveData` and exposed through the official `Setting` class
4. Built with the same toolchain as the official plugin-sample: webpack + esbuild-loader + sass + mini-css-extract-plugin

## Packaging

* Run `pnpm run build` (or `npm run build`) to generate `package.zip`
* The `package.zip` contains: `i18n/`, `icon.png`, `index.css`, `index.js`, `plugin.json`, `preview.png`, `README*.md`

## Publishing

* Create a new release on GitHub, using the plugin version as the "Tag version", e.g. `v1.0.0`
* Upload `package.zip` as a binary asset
* Submit the release
* For the first release, create a PR to the [Community Bazaar](https://github.com/siyuan-note/bazaar) repository and add your repo to `plugins.json`

## FAQ

### Auto focus does not work after switching documents?

* Make sure "Auto focus when switching documents" is enabled in the plugin settings
* Open DevTools (`Ctrl+Shift+I`) and check the console for errors
* Make sure you have clicked or edited in the target document before (the plugin needs a recorded cursor position)

### Highlight does not show?

* Check whether the element has the `cursor-focus-highlight` class
* Check for CSS conflicts with your current theme

### How to get the block ID?

```typescript
// Method 1: from the data attribute
const blockId = block.dataset.nodeId;

// Method 2: from the SiYuan kernel API (via RPC)
const blockInfo = await this.kernel.rpc.call["api.block.getBlockInfo"]({id: blockId});
```

## License

[MIT](LICENSE)
