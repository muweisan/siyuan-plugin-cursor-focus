# Cursor Focus

A SiYuan Note plugin based on the "SiYuan Plugin Development Guide: Cursor Positioning": **auto-scroll to the cursor block and highlight it when switching documents**.

## Features

- **Auto focus on document switch**: scrolls to the block where the cursor was last placed in that document
- **Highlight**: the located block flashes briefly; duration configurable (500–5000 ms, default 2000 ms)
- **Manual focus**: a top-bar button to locate the current cursor block at any time
- **i18n**: UI texts switch between Chinese and English automatically

## Installation

### Local install

1. Build the plugin: `npm run build` (or `pnpm run build`)
2. In SiYuan, open "Settings" → "Bazaar" → "Third-party"
3. Click "Install local plugin" and select the built `dist` folder of this project

## Settings

After installation, open the settings of "Cursor Focus" in the installed plugin list:

| Setting | Description | Default |
| --- | --- | --- |
| Auto focus when switching documents | Locate the cursor block automatically on document switch | On |
| Highlight duration (ms) | Duration of the highlight animation (500–5000) | 2000 |

## Development

Requires Node.js v16+.

```bash
npm install        # install dependencies
npm run dev        # watch mode
npm run build      # build into dist/
```

## Project structure

```
cursor-focus/
├── plugin.json          # plugin config
├── package.json         # npm config
├── tsconfig.json        # TypeScript config
├── rollup.config.js     # Rollup config
├── src/
│   ├── index.ts         # plugin entry
│   ├── cursor.ts        # cursor focus core logic
│   ├── styles.css       # styles
│   └── styles.d.ts      # CSS module type declaration
├── i18n/                # UI texts (zh_CN / en_US)
├── icon.png             # plugin icon
├── README.md            # this file
└── dist/                # build output (generated)
```

## Implementation notes

Based on the guide document, with the following fixes and improvements:

1. Uses the official SiYuan `switch-protyle` event as the primary switch listener; the guide's MutationObserver approach is kept as a fallback (with 500 ms debounce).
2. SiYuan loses the selection when switching away from a document, so the plugin continuously records the last cursor block of each document and restores the position when switching back.
3. Settings are read from `this.plugin.data` (the guide's `this.plugin.settings` is not part of the SiYuan API).
4. Message toasts work on both the new SiYuan API (standalone `showMessage` function) and the old one (`Plugin#showMessage` method).
5. The guide's `iife + external: ["siyuan"]` output cannot be loaded by SiYuan; switched to the official `cjs` format.
6. SiYuan plugins can only load `index.js`, so `styles.css` is injected at runtime via a custom Rollup plugin.
7. Added an `i18n/` folder for Chinese / English UI texts.

## FAQ

### Auto focus does not work after switching documents?

- Make sure "Auto focus when switching documents" is enabled;
- Open DevTools (`Ctrl+Shift+I`) and check the console for errors;
- Make sure you have clicked or edited in the target document before (the plugin needs a recorded cursor position).

### Highlight does not show?

- Check whether the element has the `cursor-focus-highlight` class;
- Check for CSS conflicts with your current theme.

### How to get the block ID?

```typescript
// Method 1: from the data attribute
const blockId = block.dataset.nodeId;

// Method 2: from the SiYuan API (via kernel RPC in newer versions)
const blockInfo = await this.kernel.rpc.call["api.block.getBlockInfo"]({ id: blockId });
```

## References

- [SiYuan plugin development docs](https://github.com/siyuan-note/siyuan)
- [SiYuan plugin API docs](https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md)
- [SiYuan plugin sample](https://github.com/siyuan-note/plugin-sample)
- [Rollup docs](https://rollupjs.org/)
- [TypeScript docs](https://www.typescriptlang.org/)

## License

[MIT](LICENSE)
