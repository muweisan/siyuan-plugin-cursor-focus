# 光标定位（Cursor Focus）

基于《思源插件开发指南：光标定位》实现的思源笔记（SiYuan Note）插件：**切换文档时自动跳转到光标所在块，并高亮显示**。

## 功能特性

- **切换文档自动定位**：切换文档标签时，自动滚动到该文档中上次光标所在的块
- **高亮提示**：被定位的块短暂高亮闪烁，时长可在设置中调整（500–5000ms，默认 2000ms）
- **手动定位**：顶栏按钮可随时手动定位到当前光标块
- **中 / 英文界面**：界面文案随思源语言设置自动切换

## 安装

### 本地安装

1. 构建插件：`npm run build`（或 `pnpm run build`）
2. 在思源中打开「设置」→「集市」→「第三方」
3. 点击「安装本地插件」，选择本项目编译后的 `dist` 文件夹

## 配置项

安装后，在「设置」→「集市」已安装插件列表中找到「光标定位」并打开设置：

| 配置项 | 说明 | 默认值 |
| --- | --- | --- |
| 切换文档时自动聚焦 | 切换文档时是否自动定位到光标块 | 开启 |
| 高亮时长（毫秒） | 定位块高亮动画的时长（500–5000） | 2000 |

## 开发

要求 Node.js v16+。

```bash
npm install        # 安装依赖
npm run dev        # 开发模式（监听文件变化）
npm run build      # 构建到 dist/
```

## 项目结构

```
cursor-focus/
├── plugin.json          # 插件配置文件
├── package.json         # npm 配置
├── tsconfig.json        # TypeScript 配置
├── rollup.config.js     # Rollup 打包配置
├── src/
│   ├── index.ts         # 插件入口文件
│   ├── cursor.ts        # 光标定位核心逻辑
│   ├── styles.css       # 样式文件
│   └── styles.d.ts      # CSS 模块类型声明
├── i18n/                # 界面文案（zh_CN / en_US）
├── icon.png             # 插件图标
├── README.md            # 说明文档
└── dist/                # 编译输出目录（构建后生成）
```

## 实现说明

以指南文档的实现为基础，并做了以下修正与增强：

1. **文档切换监听**：优先使用思源官方 `switch-protyle` 事件；指南中的 MutationObserver 方案保留作为兜底（带 500ms 防抖，避免重复触发）。
2. **光标位置记录**：思源切换文档后原编辑器的选区会丢失，插件会持续记录每个文档最近的光标位置，切换回来时据此定位。
3. **设置读取**：指南中的 `this.plugin.settings` 并非思源 API，实际从插件数据 `this.plugin.data` 读取（带默认值兜底）。
4. **消息提示**：兼容新版思源（独立导出的 `showMessage` 函数）与旧版（`Plugin#showMessage` 方法）两种 API。
5. **打包格式**：指南中的 `iife + external: ["siyuan"]` 无法产出可被思源加载的插件，改为思源官方示例使用的 `cjs` 格式。
6. **样式打包**：思源插件只能加载 `index.js`，通过 Rollup 自定义插件将 `styles.css` 注入为运行时样式，确保高亮动画生效。
7. **多语言**：新增 `i18n/` 目录，`focusToCursor`、`noCursor` 等文案随思源语言切换。

## 常见问题

### 切换文档后没有自动聚焦？

- 确认「切换文档时自动聚焦」设置已启用；
- 打开开发者工具（`Ctrl+Shift+I`）查看控制台是否有报错；
- 确认此前曾在目标文档中点击或编辑过（插件需要记录过光标位置）。

### 高亮效果不显示？

- 检查元素是否添加了 `cursor-focus-highlight` 类；
- 检查 CSS 动画语法以及当前主题是否有样式覆盖。

### 如何获取块 ID？

```typescript
// 方法 1：从 data 属性
const blockId = block.dataset.nodeId;

// 方法 2：从思源 API（新版通过 kernel RPC 调用）
const blockInfo = await this.kernel.rpc.call["api.block.getBlockInfo"]({ id: blockId });
```

## 参考资源

- [思源插件开发文档](https://github.com/siyuan-note/siyuan)
- [思源插件 API 文档](https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md)
- [思源插件示例](https://github.com/siyuan-note/plugin-sample)
- [Rollup 官方文档](https://rollupjs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 许可证

[MIT](LICENSE)
