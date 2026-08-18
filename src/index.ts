import {
    Plugin,
    Setting,
    getFrontend,
    showMessage,
} from "siyuan";
import { CursorFocus } from "./cursor";
import "./index.scss";

const STORAGE_NAME = "settings";

export default class CursorFocusPlugin extends Plugin {
    private cursorFocus?: CursorFocus;
    private isMobile: boolean;

    onload() {
        this.isMobile = getFrontend() === "mobile" || getFrontend() === "browser-mobile";

        // 注册顶栏图标（准星/靶心样式）
        this.addIcons(`<symbol id="iconCursorFocus" viewBox="0 0 32 32">
<g fill="none" stroke="currentColor" stroke-width="2">
<circle cx="16" cy="16" r="11"/>
<circle cx="16" cy="16" r="4"/>
<path d="M16 1v6M16 25v6M1 16h6M25 16h6"/>
</g>
<circle cx="16" cy="16" r="2" fill="currentColor" stroke="none"/>
</symbol>`);

        // 光标定位核心逻辑
        this.cursorFocus = new CursorFocus(this);
        this.cursorFocus.init();

        // 设置面板
        this.initSetting();
    }

    onLayoutReady() {
        // 顶栏按钮：手动触发定位（移动端无顶栏，自动定位仍生效）
        if (!this.isMobile) {
            this.addTopBar({
                icon: "iconCursorFocus",
                title: this.i18n.focusToCursor,
                position: "right",
                callback: () => {
                    this.cursorFocus?.focusToCursor();
                },
            });
        }
    }

    private initSetting() {
        const checkboxElement = document.createElement("input");
        checkboxElement.type = "checkbox";
        checkboxElement.className = "b3-switch";

        const durationElement = document.createElement("input");
        durationElement.type = "number";
        durationElement.className = "b3-text-field fn__size200";
        durationElement.min = "500";
        durationElement.max = "5000";
        durationElement.step = "100";

        this.setting = new Setting({
            confirmCallback: () => {
                const settings = {
                    autoFocus: checkboxElement.checked,
                    highlightDuration: Math.min(
                        5000,
                        Math.max(500, Math.floor(Number(durationElement.value) || 2000))
                    ),
                };
                this.saveData(STORAGE_NAME, settings).then(() => {
                    this.data[STORAGE_NAME] = settings;
                    showMessage(`[${this.name}] ${this.i18n.saved}`);
                }).catch((e) => {
                    showMessage(`[${this.name}] ${this.i18n.saveFailed}: ${e}`, 3000, "error");
                });
            },
        });
        this.setting.addItem({
            title: this.i18n.settingAutoFocus,
            description: this.i18n.settingAutoFocusDesc,
            direction: "row",
            createActionElement: () => checkboxElement,
        });
        this.setting.addItem({
            title: this.i18n.settingHighlightDuration,
            description: this.i18n.settingHighlightDurationDesc,
            direction: "row",
            createActionElement: () => durationElement,
        });

        // 载入已保存的设置
        this.loadData(STORAGE_NAME).then((data) => {
            const saved = (data ?? {}) as Partial<{autoFocus: boolean, highlightDuration: number}>;
            checkboxElement.checked = typeof saved.autoFocus === "boolean" ? saved.autoFocus : true;
            durationElement.value = String(
                typeof saved.highlightDuration === "number" ? saved.highlightDuration : 2000
            );
            this.data[STORAGE_NAME] = {
                autoFocus: checkboxElement.checked,
                highlightDuration: Number(durationElement.value),
            };
        }).catch((e) => {
            console.warn(`[${this.name}] load settings fail:`, e);
        });
    }

    onunload() {
        this.cursorFocus?.destroy();
        this.cursorFocus = undefined;
    }
}
