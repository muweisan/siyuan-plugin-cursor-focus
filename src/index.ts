import { Plugin } from "siyuan";
import { CursorFocus } from "./cursor";
import "./styles.css";

export default class CursorFocusPlugin extends Plugin {
  private cursorFocus?: CursorFocus;

  async onload() {
    console.log(this.i18n.loaded ?? "光标定位插件已加载");

    // 注册顶栏图标（准星/靶心样式）
    this.addIcons(`
      <symbol id="iconCursorFocus" viewBox="0 0 32 32">
        <g fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="16" cy="16" r="11"/>
          <circle cx="16" cy="16" r="4"/>
          <path d="M16 1v6M16 25v6M1 16h6M25 16h6"/>
        </g>
        <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none"/>
      </symbol>
    `);

    this.cursorFocus = new CursorFocus(this);

    // 初始化：监听文档切换事件并记录光标位置
    await this.cursorFocus.init();

    // 添加顶栏按钮（手动触发定位）
    this.addTopBar({
      icon: "iconCursorFocus",
      title: this.i18n.focusToCursor ?? "定位到光标所在块",
      position: "right",
      callback: () => {
        this.cursorFocus?.focusToCursor();
      },
    });
  }

  onunload() {
    console.log(this.i18n.unloaded ?? "光标定位插件已卸载");
    this.cursorFocus?.destroy();
    this.cursorFocus = undefined;
  }
}
