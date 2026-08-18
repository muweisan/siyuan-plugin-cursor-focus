import { Plugin, showMessage } from "siyuan";

const STORAGE_NAME = "settings";

interface CursorFocusSettings {
    autoFocus: boolean;
    highlightDuration: number;
}

const DEFAULT_SETTINGS: CursorFocusSettings = {
    autoFocus: true,
    highlightDuration: 2000,
};

/**
 * 光标定位核心逻辑
 *
 * 1. 监听思源官方 "switch-protyle" 事件，切换文档时自动滚动到光标所在块并高亮；
 * 2. 持续记录每个编辑器内最近的光标位置（切换文档后原选区会丢失，因此需要记录）；
 * 3. 提供手动定位（顶栏按钮），定位并高亮当前光标块；
 * 4. MutationObserver 监听布局激活状态作为兜底方案。
 */
export class CursorFocus {
    private plugin: Plugin;
    private switchObserver?: MutationObserver;
    private highlightClass = "cursor-focus-highlight";
    private highlightTimer: number | undefined;

    /** protyle 根元素 -> 最近一次光标所在块 ID */
    private lastCursorBlock = new WeakMap<HTMLElement, string>();
    /** protyle 根元素 -> 最近一次自动聚焦时间戳（防抖，避免事件与兜底监听重复触发） */
    private lastAutoFocusAt = new WeakMap<HTMLElement, number>();

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    /** 从插件数据中读取设置（带默认值兜底） */
    get settings(): CursorFocusSettings {
        const saved = this.plugin.data?.[STORAGE_NAME] as Partial<CursorFocusSettings> | undefined;
        return {
            autoFocus:
                typeof saved?.autoFocus === "boolean" ? saved.autoFocus : DEFAULT_SETTINGS.autoFocus,
            highlightDuration:
                typeof saved?.highlightDuration === "number"
                    ? saved.highlightDuration
                    : DEFAULT_SETTINGS.highlightDuration,
        };
    }

    /** 思源文档切换事件处理 */
    private onSwitchProtyle = (event: CustomEvent) => {
        const detail = event.detail as { protyle?: { element?: HTMLElement } } | undefined;
        const element = detail?.protyle?.element;
        if (!element || !this.settings.autoFocus) {
            return;
        }
        setTimeout(() => this.focusToCursor(element), 100);
    };

    /** 选区变化时记录当前光标所在块 */
    private onSelectionChange = () => {
        const editor = this.getActiveEditor();
        if (!editor) {
            return;
        }
        const block = this.getCursorBlockFromSelection();
        const nodeId = block?.dataset.nodeId;
        if (nodeId) {
            this.lastCursorBlock.set(editor, nodeId);
        }
    };

    private debouncedOnSelectionChange = this.debounce(
        () => this.onSelectionChange(),
        150
    );

    init() {
        // 1. 官方事件：切换文档时自动聚焦
        this.plugin.eventBus.on("switch-protyle", this.onSwitchProtyle);

        // 2. 持续记录光标位置
        document.addEventListener("selectionchange", this.debouncedOnSelectionChange);
        document.addEventListener("keyup", this.debouncedOnSelectionChange);
        document.addEventListener("mouseup", this.debouncedOnSelectionChange);

        // 3. 兜底：监听布局激活状态变化（防止官方事件未触发的场景）
        this.observeDocumentSwitch();
    }

    /** 获取当前激活的编辑器（protyle 根元素） */
    private getActiveEditor(): HTMLElement | null {
        return document.querySelector<HTMLElement>(
            ".layout__wnd--active .protyle:not(.fn__none)"
        );
    }

    /** 从当前选区向上查找所在块元素 */
    private getCursorBlockFromSelection(): HTMLElement | null {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return null;
        }
        const range = selection.getRangeAt(0);
        let node: Node | null = range.startContainer;

        // 向上查找最近的块元素
        while (node && node !== document.body) {
            if (node instanceof HTMLElement && this.isBlockElement(node)) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    /** 判断是否为块元素 */
    private isBlockElement(element: HTMLElement): boolean {
        return (
            Boolean(element.dataset?.nodeId) ||
            element.classList.contains("protyle-wysiwyg__block") ||
            element.classList.contains("b3-typography")
        );
    }

    /**
     * 聚焦到当前光标所在的块
     * @param editor 目标编辑器（protyle 根元素），缺省时使用当前激活编辑器
     */
    focusToCursor(editor?: HTMLElement) {
        try {
            const activeEditor = editor ?? this.getActiveEditor();
            if (!activeEditor) {
                return;
            }

            // 1. 优先使用当前选区所在块
            let block = this.getCursorBlockFromSelection();

            // 2. 当前无选区时，回退到记录的最近光标位置
            if (!block) {
                const nodeId = this.lastCursorBlock.get(activeEditor);
                block = nodeId
                    ? activeEditor.querySelector<HTMLElement>(
                        `[data-node-id="${CSS.escape(nodeId)}"]`
                    )
                    : null;
            }

            if (!block) {
                showMessage(this.plugin.i18n.noCursor, 3000, "info");
                return;
            }

            // 滚动到光标块并高亮显示
            this.scrollToBlock(block);
            this.highlightBlock(block);
        } catch (error) {
            console.error("聚焦光标块失败:", error);
        }
    }

    /** 滚动到块的中心位置 */
    private scrollToBlock(block: HTMLElement) {
        block.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }

    /** 高亮块（动画时长跟随设置项） */
    private highlightBlock(block: HTMLElement) {
        const duration = this.settings.highlightDuration;

        if (this.highlightTimer !== undefined) {
            window.clearTimeout(this.highlightTimer);
        }

        // 添加高亮类，并让动画时长与配置保持一致
        block.classList.add(this.highlightClass);
        block.style.animationDuration = `${duration}ms`;

        // 定时移除高亮
        this.highlightTimer = window.setTimeout(() => {
            block.classList.remove(this.highlightClass);
            block.style.animationDuration = "";
        }, duration);
    }

    /** 兜底监听文档切换（MutationObserver 方案） */
    private observeDocumentSwitch() {
        const observer = new MutationObserver(() => {
            const editor = this.getActiveEditor();
            if (!editor || !this.settings.autoFocus) {
                return;
            }
            const now = Date.now();
            const last = this.lastAutoFocusAt.get(editor) ?? 0;
            if (now - last < 500) {
                return;
            }
            this.lastAutoFocusAt.set(editor, now);
            setTimeout(() => this.focusToCursor(editor), 100);
        });

        // 观察主布局容器
        const layoutContainer = document.querySelector(".layout");
        if (layoutContainer) {
            observer.observe(layoutContainer, {
                subtree: true,
                childList: true,
                attributes: true,
                attributeFilter: ["class"],
            });
        }

        this.switchObserver = observer;
    }

    /** 简单防抖 */
    private debounce(fn: () => void, wait: number): () => void {
        let timer: number | undefined;
        return () => {
            if (timer !== undefined) {
                window.clearTimeout(timer);
            }
            timer = window.setTimeout(() => {
                timer = undefined;
                fn();
            }, wait);
        };
    }

    destroy() {
        if (this.switchObserver) {
            this.switchObserver.disconnect();
        }
        this.plugin.eventBus.off("switch-protyle", this.onSwitchProtyle);
        document.removeEventListener("selectionchange", this.debouncedOnSelectionChange);
        document.removeEventListener("keyup", this.debouncedOnSelectionChange);
        document.removeEventListener("mouseup", this.debouncedOnSelectionChange);

        if (this.highlightTimer !== undefined) {
            window.clearTimeout(this.highlightTimer);
        }

        // 移除所有高亮类
        document.querySelectorAll(`.${this.highlightClass}`).forEach((el) => {
            el.classList.remove(this.highlightClass);
        });
    }
}
