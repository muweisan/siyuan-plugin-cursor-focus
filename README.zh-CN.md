[English](https://github.com/muweisan/siyuan-plugin-cursor-focus/blob/main/README.md)

# 光标定位

思源笔记插件：**切换文档时自动跳转到光标所在块，并高亮显示**。项目结构依据官方 [plugin-sample](https://github.com/siyuan-note/plugin-sample) 搭建。

## 功能特性

* **切换文档自动定位**：切换文档标签时，自动滚动到该文档中上次光标所在的块
* **高亮提示**：被定位的块短暂高亮闪烁，时长可配置（500–5000 毫秒，默认 2000 毫秒）
* **手动定位**：顶栏按钮可随时手动定位到当前光标块
* **中 / 英文界面**：界面文案随思源语言设置自动切换

## 开始

* 将本仓库克隆到本地开发文件夹中，为了方便可以直接将开发文件夹放置在 `{工作空间}/data/plugins/` 下
* 安装 [NodeJS](https://nodejs.org/en/download) 和 [pnpm](https://pnpm.io/installation)（或使用 npm），然后在开发文件夹下执行 `pnpm i`（或 `npm i`）
* 执行 `pnpm run dev`（或 `npm run dev`）进行实时编译
* 在思源中打开集市并在下载选项卡中启用插件

## 设置

插件启用后，在集市中打开插件设置页，可配置：

* **切换文档时自动聚焦**：切换文档时是否自动定位到光标块（默认开启）
* **高亮时长（毫秒）**：定位块高亮动画时长，范围 500–5000 毫秒（默认 2000 毫秒）

## 开发

* `src/index.ts`：插件入口
* `src/cursor.ts`：光标定位核心逻辑
* `src/index.scss`：样式文件（构建产物为 `index.css`）
* `src/i18n/*.json`：语言配置文件
* `icon.png`（160*160）、`preview.png`（1024*768）
* [前端 API](https://github.com/siyuan-note/petal)
* [后端 API](https://github.com/siyuan-note/siyuan/blob/master/API_zh_CN.md)

### 实现说明

1. 优先使用思源官方 `switch-protyle` 事件监听文档切换，MutationObserver 监听布局激活状态作为兜底方案（带 500 毫秒防抖）
2. 思源切换文档后原编辑器的选区会丢失，插件会持续记录每个文档最近的光标位置，切换回来时据此定位
3. 设置项通过官方 `Setting` 类暴露，使用 `loadData`/`saveData` 持久化
4. 构建工具链与官方 plugin-sample 一致：webpack + esbuild-loader + sass + mini-css-extract-plugin

## 打包

* 执行 `pnpm run build`（或 `npm run build`）生成 `package.zip`
* `package.zip` 包含：`i18n/`、`icon.png`、`index.css`、`index.js`、`plugin.json`、`preview.png`、`README*.md`

## 上架集市

* 在 GitHub 上创建一个新的发布，使用插件版本号作为 "Tag version"，例如 `v1.0.0`
* 上传 `package.zip` 作为二进制附件
* 提交发布
* 首次发布还需创建一个 PR 到 [Community Bazaar](https://github.com/siyuan-note/bazaar) 仓库，将本仓库添加到 `plugins.json`

## 常见问题

### 切换文档后没有自动聚焦？

* 确认插件设置中「切换文档时自动聚焦」已启用
* 打开开发者工具（`Ctrl+Shift+I`）查看控制台是否有报错
* 确认此前曾在目标文档中点击或编辑过（插件需要记录过光标位置）

### 高亮效果不显示？

* 检查元素是否添加了 `cursor-focus-highlight` 类
* 检查 CSS 动画语法以及当前主题是否有样式覆盖

### 如何获取块 ID？

```typescript
// 方法 1：从 data 属性
const blockId = block.dataset.nodeId;

// 方法 2：从思源内核 API（通过 RPC 调用）
const blockInfo = await this.kernel.rpc.call["api.block.getBlockInfo"]({id: blockId});
```

## 许可证

[MIT](LICENSE)
