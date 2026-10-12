import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n } from '@servicenow/aiux-services';
import { snHttp } from '@servicenow/aiux-utils';


/**
 * Responsive Preview
 * Free-transform resizable viewport for previewing widgets.
 * Left/right drag handles to resize width, bottom handle for height.
 * Dot-grid background, centered viewport frame.
 *
 * @property {String} widgetId - Widget element ID
 *
 * Public API:
 *   refresh()                  - Reload preview iframe with fresh widget code
 *   refreshFromSource(source)  - Reload preview (source already saved to DB)
 */
const ARC_SPINNER_CONFIG = Object.freeze({
      animationData: {"v":"5.7.4","fr":60,"ip":0,"op":60,"w":100,"h":100,"nm":"Arc Spinner","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Arc","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},{"t":60,"s":[360]}]},"p":{"a":0,"k":[50,50,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"ao":0,"shapes":[{"ty":"el","d":1,"s":{"a":0,"k":[15,15]},"p":{"a":0,"k":[0,0]},"nm":"Circle"},{"ty":"tm","s":{"a":0,"k":0},"e":{"a":0,"k":65},"o":{"a":0,"k":0},"m":1,"nm":"Trim"},{"ty":"st","c":{"a":0,"k":[0.2,0.2,0.2,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":3.5},"lc":2,"lj":2,"nm":"Stroke"}],"ip":0,"op":60,"st":0}]},
      renderer: 'svg',
      loop: true,
      autoplay: true
    });

class AiuxBuilderResponsivePreview extends AIUXWidgetElement {
    static styles = css`

        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            font-family: var(--font-servicenow, 'Servicenow Sans', sans-serif);
            overflow: hidden;
            position: relative;
        }

        /* ---- Floating Zoom Pill ---- */
        .zoom-pill {
            position: absolute;
            bottom: calc(var(--spacing, 0.25rem) * 4);
            right: calc(var(--spacing, 0.25rem) * 4);
            z-index: 5;
            display: flex;
            align-items: center;
            gap: calc(var(--spacing, 0.25rem) * 0.5);
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(var(--blur-sm, 8px));
            -webkit-backdrop-filter: blur(var(--blur-sm, 8px));
            border-radius: var(--radius-full, 9999px);
            padding: calc(var(--spacing, 0.25rem) * 1) calc(var(--spacing, 0.25rem) * 1.5);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06);
            user-select: none;
        }

        .zoom-pill-label {
            font-size: var(--text-xs, 0.75rem);
            font-weight: var(--font-weight-medium, 500);
            color: var(--color-base-content-secondary, #6b7280);
            font-variant-numeric: tabular-nums;
            min-width: calc(var(--spacing, 0.25rem) * 9);
            text-align: center;
            cursor: pointer;
            line-height: calc(var(--spacing, 0.25rem) * 6);
        }

        .zoom-pill-label:hover {
            color: var(--color-base-content, #1f2937);
        }

        /* ---- Preview Wrapper (dot-grid bg) ---- */
        .preview-wrapper {
            flex: 1;
            min-height: 0;
            height: 100%;
            position: relative;
            overflow: auto;
        }

        /* ---- Viewport Container (centers the frame, zoomable) ---- */
        .viewport-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100%;
            padding: calc(var(--spacing, 0.25rem) * 6);
            /* Use CSS zoom instead of transform: scale() so the layout size
               changes with the zoom level and overflow/scroll works correctly. */
            transition: zoom 0.15s var(--ease-out, ease);
        }

        /* ---- Resize Layout (frame + handles) ---- */
        .resize-layout {
            display: flex;
            align-items: stretch;
            flex-shrink: 0;
            position: relative;
        }

        /* ---- Resize Handles (left/right) ---- */
        .resize-handle-h {
            width: calc(var(--spacing, 0.25rem) * 4);
            cursor: ew-resize;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            user-select: none;
            -webkit-user-select: none;
        }

        .resize-handle-h:hover .grip-bar,
        .resize-handle-h.active .grip-bar {
            background: var(--color-primary, #1389AA);
        }

        .grip-bar {
            width: calc(var(--spacing, 0.25rem) * 1);
            height: calc(var(--spacing, 0.25rem) * 8);
            border-radius: var(--radius-xs, 0.125rem);
            background: var(--color-base-content, #1f2937);
            transition: background 0.15s var(--ease-out, ease);
        }

        /* ---- Resize Handle (bottom) ---- */
        .resize-handle-v {
            height: calc(var(--spacing, 0.25rem) * 4);
            cursor: ns-resize;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            user-select: none;
            -webkit-user-select: none;
            position: absolute;
            bottom: calc(var(--spacing, 0.25rem) * -4);
            left: calc(var(--spacing, 0.25rem) * 4);
            right: calc(var(--spacing, 0.25rem) * 4);
        }

        .resize-handle-v:hover .grip-bar-h,
        .resize-handle-v.active .grip-bar-h {
            background: var(--color-primary, #1389AA);
        }

        .grip-bar-h {
            width: calc(var(--spacing, 0.25rem) * 8);
            height: calc(var(--spacing, 0.25rem) * 1);
            border-radius: var(--radius-xs, 0.125rem);
            background: var(--color-base-content, #1f2937);
            transition: background 0.15s var(--ease-out, ease);
        }

        /* ---- Corner Resize Handle ---- */
        .resize-handle-corner {
            width: calc(var(--spacing, 0.25rem) * 4);
            height: calc(var(--spacing, 0.25rem) * 4);
            cursor: nwse-resize;
            position: absolute;
            bottom: calc(var(--spacing, 0.25rem) * -4);
            right: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            user-select: none;
            -webkit-user-select: none;
        }

        .resize-handle-corner:hover .grip-corner,
        .resize-handle-corner.active .grip-corner {
            border-color: var(--color-primary, #1389AA);
        }

        .grip-corner {
            width: calc(var(--spacing, 0.25rem) * 2);
            height: calc(var(--spacing, 0.25rem) * 2);
            border-inline-end: 2px solid var(--color-base-content, #1f2937);
            border-bottom: 2px solid var(--color-base-content, #1f2937);
            transition: border-color 0.15s var(--ease-out, ease);
        }

        /* ---- Viewport Frame ---- */
        .viewport-frame {
            background: var(--color-base-100, #ffffff);
            border-radius: var(--radius-2xl, 1rem);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            flex-shrink: 0;
            padding: calc(var(--spacing, 0.25rem) * 2);
            min-width: 280px;
            min-height: 200px;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
        }

        .viewport-frame.resizing {
            transition: none;
        }

        /* ---- Preview host (replaces iframe) ---- */
        .preview-host {
            width: 100%;
            height: 100%;
            display: block;
            border-radius: 12px;
            min-height: 200px;
            overflow: auto;
            padding: calc(var(--spacing, 0.25rem) * 2);
        }

        /* ---- Empty State ---- */
        .preview-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 300px;
            gap: calc(var(--spacing, 0.25rem) * 3);
            color: var(--color-base-content-secondary, #6b7280);
        }

        .preview-empty-icon {
            width: calc(var(--spacing, 0.25rem) * 12);
            height: calc(var(--spacing, 0.25rem) * 12);
            opacity: 0.4;
        }

        .preview-empty-text {
            font-size: var(--text-sm, 0.875rem);
        }

        /* ---- Creation placeholder ---- */
        .placeholder-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            height: 100%;
            min-height: 300px;
            gap: calc(var(--spacing, 0.25rem) * 2);
            padding: calc(var(--spacing, 0.25rem) * 8);
        }
        .placeholder-title {
            margin: 0;
            font-size: var(--text-xl, 1.25rem);
            font-weight: var(--font-weight-semibold, 600);
            color: var(--color-base-content, #1e293b);
        }
        .placeholder-text {
            margin: 0;
            font-size: var(--text-sm, 0.875rem);
            line-height: 1.5;
            color: var(--color-base-content-secondary, #64748b);
            max-width: 320px;
        }

        /* ---- Loading overlay ---- */
        .loading-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-base-100, #ffffff);
            border-radius: var(--radius-2xl, 1rem);
            z-index: 10;
        }

        /* ---- Centered Loader (replaces entire preview) ---- */
        .centered-loader {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            background: transparent;
        }


        /* ---- Skeleton loader ---- */
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }

        .skeleton-layout {
            display: flex;
            flex-direction: column;
            gap: calc(var(--spacing, 0.25rem) * 5);
            width: 100%;
            height: 100%;
            padding: calc(var(--spacing, 0.25rem) * 8);
            box-sizing: border-box;
        }

        .skeleton-top {
            display: flex;
            gap: calc(var(--spacing, 0.25rem) * 5);
        }

        .skeleton-lines {
            display: flex;
            flex-direction: column;
            gap: calc(var(--spacing, 0.25rem) * 3);
            flex: 1;
        }

        .skeleton-line {
            height: calc(var(--spacing, 0.25rem) * 3.5);
            border-radius: var(--radius-full, 9999px);
            border: 1.5px solid var(--color-base-300, #d1d5db);
            background: var(--color-base-200, #EDECE9);
        }

        .skeleton-layout.animated .skeleton-line,
        .skeleton-layout.animated .skeleton-thumb {
            background: linear-gradient(90deg, var(--color-base-100, #ffffff) 25%, var(--color-base-200, #e5e7eb) 50%, var(--color-base-100, #ffffff) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s ease infinite;
        }
        .skeleton-line--long { width: 85%; }
        .skeleton-line--med { width: 70%; }
        .skeleton-line--short1 { width: 55%; }
        .skeleton-line--short2 { width: 50%; }

        .skeleton-thumb {
            width: calc(var(--spacing, 0.25rem) * 18);
            height: calc(var(--spacing, 0.25rem) * 18);
            border-radius: var(--radius-lg, 0.5rem);
            border: 1.5px solid var(--color-base-300, #d1d5db);
            background: var(--color-base-200, #EDECE9);
            flex-shrink: 0;
        }

        .skeleton-bottom {
            display: flex;
            flex-direction: column;
            gap: calc(var(--spacing, 0.25rem) * 3);
        }

        /* ---- Drag overlay (prevents iframe stealing events) ---- */
        .drag-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
        }

        .drag-overlay.ew { cursor: ew-resize; }
        .drag-overlay.ns { cursor: ns-resize; }
        .drag-overlay.nwse { cursor: nwse-resize; }

        @media (prefers-reduced-motion: reduce) {
            .skeleton-circle, .skeleton-line, .skeleton-block, .skeleton-btn, .skeleton-tab { animation: none; }
        }

        /* ---- Error fallback ---- */
        .preview-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 200px;
            gap: calc(var(--spacing, 0.25rem) * 3);
            padding: calc(var(--spacing, 0.25rem) * 6);
            text-align: center;
        }

        .preview-error-icon {
            width: calc(var(--spacing, 0.25rem) * 12);
            height: calc(var(--spacing, 0.25rem) * 12);
            border-radius: var(--radius-full, 9999px);
            background: rgba(239, 68, 68, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .preview-error-icon svg {
            width: calc(var(--spacing, 0.25rem) * 6);
            height: calc(var(--spacing, 0.25rem) * 6);
            stroke: var(--color-error, #ef4444);
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .preview-error-title {
            margin: 0;
            font-size: var(--text-sm, 0.875rem);
            font-weight: var(--font-weight-semibold, 600);
            color: var(--color-error, #dc2626);
        }

        .preview-error-hint {
            margin: 0;
            font-size: var(--text-xs, 0.75rem);
            color: var(--color-base-content-secondary, #6b7280);
            max-width: 360px;
            line-height: 1.5;
        }

        .preview-error-detail {
            margin-top: calc(var(--spacing, 0.25rem) * 1);
            font-size: var(--text-xs, 0.75rem);
            color: var(--color-base-content-secondary, #9ca3af);
            max-width: 400px;
            text-align: left;
        }

        .preview-error-detail summary {
            cursor: pointer;
            user-select: none;
        }

        .preview-error-detail code {
            display: block;
            margin-top: calc(var(--spacing, 0.25rem) * 1.5);
            padding: calc(var(--spacing, 0.25rem) * 2);
            background: var(--color-base-200, #f9fafb);
            border-radius: var(--radius-md, 0.375rem);
            white-space: pre-wrap;
            word-break: break-word;
            font-size: var(--text-xs, 0.75rem);
        }

        .preview-error-retry {
            margin-top: calc(var(--spacing, 0.25rem) * 2);
            padding: calc(var(--spacing, 0.25rem) * 1.5) calc(var(--spacing, 0.25rem) * 4);
            font-size: var(--text-xs, 0.75rem);
            font-weight: var(--font-weight-medium, 500);
            background: var(--color-base-200, #f3f4f6);
            border: 1px solid var(--color-base-300, #e5e7eb);
            border-radius: var(--radius-md, 0.375rem);
            cursor: pointer;
            color: var(--color-base-content, #374151);
            transition: background 0.15s var(--ease-out, ease);
        }

        .preview-error-retry:hover {
            background: var(--color-base-300, #e5e7eb);
        }
    `;

    static properties = {
        widgetId:        { type: String, attribute: 'widget-id' },
        /** When true, skip the automatic widget load in firstUpdated (used during manual save) */
        suppressAutoLoad: { type: Boolean, attribute: 'suppress-auto-load' },
        /** When true, show a creation placeholder inside the viewport frame instead of the iframe */
        placeholder:     { type: Boolean },
        /** Preview input props — passed as URL params to the iframe */
        previewProps:    { type: Object, attribute: false },
        _viewportWidth:  { type: Number, state: true },
        _viewportHeight: { type: Number, state: true },
        _isResizing:     { type: Boolean, state: true },
        _resizeMode:     { type: String, state: true },
        _refreshing:     { type: Boolean, state: true },
        _containerWidth: { type: Number, state: true },
        _zoom:           { type: Number, state: true },
        _loading:        { type: Boolean, state: true },
        /** Error info object: { title, hint, detail } or null */
        _previewError:   { type: Object, state: true },
    };

    constructor() {
        super();
        this.widgetId = '';
        this.placeholder = false;
        this.previewProps = {};
        this._viewportWidth = 0;  // 0 = auto (widget determines its own bounds)
        this._viewportHeight = 0;
        this._isResizing = false;
        this._resizeMode = null; // 'left' | 'right' | 'bottom' | 'corner'
        this._refreshing = false;
        this._containerWidth = 800;
        this._zoom = 1;
        this._loading = false;
        this._previewError = null;

        // Drag state (not reactive)
        this._startX = 0;
        this._startY = 0;
        this._startWidth = 0;
        this._startHeight = 0;

        this._loadGen = 0;
        if (!window.__aiuxPreviewSuccessMap) window.__aiuxPreviewSuccessMap = {};
        // Cache real customElements methods once — overlapping loads must
        // not capture each other's patches as "originals".
        // NOTE: this assumes no other code has patched customElements
        // before the first preview instance is constructed.
        if (!window.__aiuxRealCE) {
            window.__aiuxRealCE = {
                define: customElements.define.bind(customElements),
                get: customElements.get.bind(customElements),
                whenDefined: customElements.whenDefined.bind(customElements),
                protoDef: CustomElementRegistry.prototype.define,
            };
        }

        // Bind handlers
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onResizeObserve = this._onResizeObserve.bind(this);
        this._onWheel = this._onWheel.bind(this);
        this._resizeObserver = null;
    }

    connectedCallback() {
        super.connectedCallback();
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('mouseup', this._onMouseUp);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('mouseup', this._onMouseUp);
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
    }

    firstUpdated() {
        this._observeWrapper();
        // Attach wheel zoom on preview wrapper
        const wrapper = this.renderRoot?.querySelector('.preview-wrapper');
        if (wrapper) {
            wrapper.addEventListener('wheel', this._onWheel, { passive: false });
        }
        // Load widget if widgetId is already set.
        // Skip when suppressAutoLoad is set (manual save in progress — caller will
        // show the loader and trigger refresh after save completes).
        if (this.widgetId && !this.placeholder && !this.suppressAutoLoad) {
            this._loadScopedWidget({ autoTriggered: true });
        }
    }

    updated(changed) {
        super.updated?.(changed);
        // Re-observe if widgetId changed — but skip on first render (firstUpdated handles it)
        if (changed.has('widgetId') && changed.get('widgetId') !== undefined) {
            this._observeWrapper();
            if (this.widgetId && !this.placeholder && !this.suppressAutoLoad) {
                this._loadScopedWidget({ autoTriggered: true });
            }
        }
    }

    _observeWrapper() {
        if (this._resizeObserver) this._resizeObserver.disconnect();
        const wrapper = this.renderRoot?.querySelector('.preview-wrapper');
        if (wrapper) {
            this._resizeObserver = new ResizeObserver(this._onResizeObserve);
            this._resizeObserver.observe(wrapper);
        }
    }

    _onResizeObserve(entries) {
        for (const entry of entries) {
            const w = entry.contentRect.width;
            if (!w) return; // hidden (display:none) — ignore
            this._containerWidth = w;
            // Clamp explicit width if it exceeds container
            if (this._viewportWidth && this._viewportWidth > w - 80) {
                this._viewportWidth = Math.max(280, w - 80);
            }
        }
    }

    // -----------------------------------------------------------
    // Drag resize
    // -----------------------------------------------------------
    _onHandleMouseDown(e, mode) {
        e.preventDefault();
        // If auto (0), capture actual rendered size before starting drag
        // getBoundingClientRect returns scaled dimensions, so divide by zoom
        if (!this._viewportWidth || !this._viewportHeight) {
            const frame = this.renderRoot?.querySelector('.viewport-frame');
            if (frame) {
                const rect = frame.getBoundingClientRect();
                const z = this._zoom || 1;
                if (!this._viewportWidth) this._viewportWidth = Math.round(rect.width / z);
                if (!this._viewportHeight) this._viewportHeight = Math.round(rect.height / z);
            }
        }
        this._isResizing = true;
        this._resizeMode = mode;
        this._startX = e.clientX;
        this._startY = e.clientY;
        this._startWidth = this._viewportWidth;
        this._startHeight = this._viewportHeight;
    }

    _onMouseMove(e) {
        if (!this._isResizing) return;

        // Divide by zoom to convert screen-space pixels to content-space
        const z = this._zoom || 1;
        const dx = (e.clientX - this._startX) / z;
        const dy = (e.clientY - this._startY) / z;
        const maxW = (this._containerWidth - 80) / z;
        const mode = this._resizeMode;

        // Width changes
        if (mode === 'left' || mode === 'right' || mode === 'corner') {
            const multiplier = mode === 'left' ? -1 : 1;
            const newW = Math.max(280, Math.min(maxW, this._startWidth + dx * multiplier));
            this._viewportWidth = Math.round(newW);
        }

        // Height changes (clamp to max 2000px)
        if (mode === 'bottom' || mode === 'corner') {
            const newH = Math.max(200, Math.min(2000, this._startHeight + dy));
            this._viewportHeight = Math.round(newH);
        }
    }

    _onMouseUp() {
        if (!this._isResizing) return;
        this._isResizing = false;
        this._resizeMode = null;
    }

    // -----------------------------------------------------------
    // Widget preview (no iframe — uses suffixed tag names)
    // -----------------------------------------------------------

    /**
     * Load widget using patched customElements.define with suffixed tag names.
     */
    async _loadScopedWidget({ autoTriggered = false } = {}) {
        if (!this.widgetId || this.placeholder) return;

        // Suppress auto-triggered loads within 15 s of a successful load.
        const LOAD_COOLDOWN_MS = 15000;
        const cached = window.__aiuxPreviewSuccessMap?.[this.widgetId];
        if (autoTriggered && cached?.time && (Date.now() - cached.time) < LOAD_COOLDOWN_MS) {
            const container = this.renderRoot?.querySelector('.preview-host');
            if (container && cached.tag && window.__aiuxRealCE.get(cached.tag)) {
                container.innerHTML = '';
                container.appendChild(document.createElement(cached.tag));
                this.dispatchEvent(new CustomEvent('wb-preview-load', {
                    bubbles: true, composed: true,
                    detail: { widgetId: this.widgetId, success: true },
                }));
            }
            return;
        }

        const gen = ++this._loadGen;

        this._refreshing = true;
        this._previewError = null;
        this.requestUpdate();
        await this.updateComplete;

        // Abort if a newer load was started while we awaited
        if (gen !== this._loadGen) return;

        const container = this.renderRoot?.querySelector('.preview-host');
        if (!container) { this._refreshing = false; return; }

        const origDefine = window.__aiuxRealCE.define;
        const origGet = window.__aiuxRealCE.get;
        const origWhenDefined = window.__aiuxRealCE.whenDefined;
        const origPrototypeDefine = window.__aiuxRealCE.protoDef;

        try {
            const cb = Date.now();
            const lang = (window.NOW?.language || 'en');
            const url = '/aix/widget/' + this.widgetId + '.jsdbx?lang=' + lang + '&cb=' + cb;

            // Unique suffix for this load cycle
            const suffix = '--pv' + Date.now().toString(36);
            const suffixedTag = this.widgetId + suffix;

            // Track errors that occur inside the module during define()
            let defineError = null;
            // Track all define() calls for timeout diagnostics
            const definedNames = [];

            // Patch customElements — only the widget's own element may be suffixed
            // (and only when its name already contains --pv, i.e. it was previously
            // suffixed by an earlier load cycle).  All other elements (platform
            // components, aiux deps) register under their real names so the widget's
            // Lit template can resolve them normally.
            const widgetId = this.widgetId;
            const patchedDefine = function(name, ctor, options) {
                // Match both the original name and any previously-suffixed
                // variant (the platform JSDBX may embed the old suffix).
                const isOwnElement = (name === widgetId) || name.startsWith(widgetId + '--pv');
                // Always derive target from widgetId (not name) so we never
                // stack old-suffix + new-suffix.
                const target = isOwnElement ? widgetId + suffix : name;
                definedNames.push({ original: name, target });
                try {
                    if (!origGet(target)) origDefine(target, ctor, options);
                } catch (e) {
                    if (isOwnElement) {
                        defineError = e;
                        throw e;
                    }
                    // Non-fatal: dependency already registered globally — skip silently.
                    console.warn('[Preview] dependency already registered, skipping:', name);
                }
            };
            customElements.define = patchedDefine;
            // Also patch the prototype so platform code using
            // CustomElementRegistry.prototype.define.call(...) is intercepted.
            CustomElementRegistry.prototype.define = patchedDefine;
            customElements.get = function(name) {
                // For the widget's own element — whether the original name
                // or a previously-suffixed variant — always return undefined
                // so the bundle's guard (if (!customElements.get(tag)))
                // passes and define() fires through our patch.
                if (name === widgetId || name.startsWith(widgetId + '--pv')) {
                    return undefined;
                }
                return origGet(name);
            };

            let jsdbxText = '';
            try {
                const resp = await snHttp.get(url).catch(() => null);
                jsdbxText = typeof resp?.data === 'string' ? resp.data : '';
            } catch (fetchErr) {
                console.warn('[Preview] JSDBX fetch failed', fetchErr);
            }

            // Abort if a newer load started during fetch
            if (gen !== this._loadGen) return;

            // If the JSDBX is empty, the platform hasn't compiled it yet.
            if (jsdbxText.length < 50) {
                const prevCached = window.__aiuxPreviewSuccessMap?.[this.widgetId];
                if (prevCached?.tag && origGet(prevCached.tag)) {
                    container.innerHTML = '';
                    container.appendChild(document.createElement(prevCached.tag));
                    if (window.__aiuxPreviewSuccessMap) {
                        window.__aiuxPreviewSuccessMap[this.widgetId] = { time: Date.now(), tag: prevCached.tag };
                    }
                    this.dispatchEvent(new CustomEvent('wb-preview-load', {
                        bubbles: true, composed: true,
                        detail: { widgetId: this.widgetId, success: true },
                    }));
                    return;
                }
                // Defense-in-depth: the playground already polls up to
                // 30 s on creation (_waitForJsdbxReady), so this retry
                // mainly covers non-creation loads (e.g. manual refresh).
                const JSDBX_RETRY_MS = 3000;
                const JSDBX_MAX_RETRIES = 4;
                for (let r = 0; r < JSDBX_MAX_RETRIES; r++) {
                    if (gen !== this._loadGen) return;
                    await new Promise(ok => setTimeout(ok, JSDBX_RETRY_MS));
                    try {
                        const retryUrl = '/aix/widget/' + this.widgetId + '.jsdbx?lang=' + lang + '&cb=' + Date.now();
                        const retryResp = await snHttp.get(retryUrl).catch(() => null);
                        jsdbxText = typeof retryResp?.data === 'string' ? retryResp.data : '';
                        if (jsdbxText.length >= 50) break;
                    } catch (_e) {}
                }
                if (gen !== this._loadGen) return;
                if (jsdbxText.length < 50) {
                    throw new Error(
                        'Widget bundle is empty after ' + JSDBX_MAX_RETRIES + ' retries. '
                        + 'The platform has not compiled this widget yet. '
                        + 'Try refreshing in a few seconds.'
                    );
                }
            }

            // Strategy 1: import() as ES module (disabled — causes 500 on some instances)
            try {
                await import(/* @vite-ignore */ url);
            } catch (importErr) {
                const msg = importErr?.message || String(importErr);
                console.warn('[Preview] import() failed, will try <script> fallback:', msg);
            }

            // Abort if a newer load started during import
            if (gen !== this._loadGen) return;

            // If define() threw inside the module, surface it now
            if (defineError) {
                const msg = defineError?.message || String(defineError);
                throw new Error('Widget registration failed: ' + msg);
            }

            // Strategy 2: <script> tag if import() didn't produce any defines
            if (definedNames.length === 0 && !origGet(suffixedTag) && !origGet(widgetId) && jsdbxText.length > 100) {
                try {
                    const script = document.createElement('script');
                    script.textContent = jsdbxText;
                    document.head.appendChild(script);
                    document.head.removeChild(script);
                } catch (scriptErr) {
                    console.warn('[Preview] <script> fallback failed:', scriptErr);
                }
            }

            // Abort if a newer load started during script
            if (gen !== this._loadGen) return;

            // Determine which tag to render (suffixed → real name → cached)
            let resolvedTag = origGet(suffixedTag) ? suffixedTag : null;

            if (!resolvedTag && origGet(widgetId)) {
                resolvedTag = widgetId;
            }

            // Fallback: reuse tag from a previous successful load
            if (!resolvedTag) {
                const prevCached = window.__aiuxPreviewSuccessMap?.[this.widgetId];
                if (prevCached?.tag && origGet(prevCached.tag)) {
                    resolvedTag = prevCached.tag;
                }
            }

            if (!resolvedTag) {
                const DEFINE_TIMEOUT_MS = 20000;
                let timeoutId;
                resolvedTag = await Promise.race([
                    origWhenDefined(suffixedTag).then(() => suffixedTag),
                    origWhenDefined(widgetId).then(() => widgetId),
                    new Promise((_, rej) => {
                        timeoutId = setTimeout(() => rej(new Error(
                            'Widget define timeout (' + (DEFINE_TIMEOUT_MS / 1000) + 's). '
                            + 'The widget code loaded but did not register the <' + this.widgetId + '> element. '
                            + (definedNames.length
                                ? 'Registered elements: [' + definedNames.map(d => d.original).join(', ') + '] \u2014 none matched the expected tag.'
                                : 'No customElements.define() calls were detected.')
                        )), DEFINE_TIMEOUT_MS);
                    }),
                ]);
                clearTimeout(timeoutId);
            }

            // Restore immediately on success (finally block is the safety net)
            customElements.define = origDefine;
            customElements.get = origGet;
            CustomElementRegistry.prototype.define = origPrototypeDefine;

            // Render — widget's connectedCallback handles its own data fetching
            container.innerHTML = '';
            const widgetEl = document.createElement(resolvedTag);
            container.appendChild(widgetEl);

            // Apply pending props if any (from Apply button)
            if (this._pendingProps) {
                Object.entries(this._pendingProps).forEach(([key, val]) => {
                    try { widgetEl[key] = val; } catch (_e) {}
                });
                // Re-fetch with new props since server script may need them
                if (widgetEl.server?.update) {
                    try { await widgetEl.server.update(); } catch (_e) {
                        console.warn('[Preview] server.update failed:', _e);
                    }
                }
                this._pendingProps = null;
            }

            if (window.__aiuxPreviewSuccessMap) {
                window.__aiuxPreviewSuccessMap[this.widgetId] = { time: Date.now(), tag: resolvedTag };
            }

            // Notify parent: preview loaded successfully
            this.dispatchEvent(new CustomEvent('wb-preview-load', {
                bubbles: true, composed: true,
                detail: { widgetId: this.widgetId, success: true },
            }));
        } catch (err) {
            console.error('[Preview] Failed to load widget:', this.widgetId, err);
            const errMsg = err?.message || String(err);

            // Set reactive error state — Lit re-renders the fallback template
            this._previewError = this._classifyError(errMsg);

            // Dispatch error event so parent (widget editor) can notify the owner
            this.dispatchEvent(new CustomEvent('wb-preview-error', {
                bubbles: true, composed: true,
                detail: { widgetId: this.widgetId, error: errMsg },
            }));
        } finally {
            // ALWAYS restore customElements to prevent global corruption
            customElements.define = origDefine;
            customElements.get = origGet;
            CustomElementRegistry.prototype.define = origPrototypeDefine;
            this._refreshing = false;
            this._loading = false;
        }
    }

    /**
     * Classify an error message into a user-friendly { title, hint, detail } object.
     */
    _classifyError(errMsg) {
        let title = i18n.getMessage('Widget failed to load');
        let hint = '';
        if (errMsg.includes('is not defined') || errMsg.includes('Missing dependency')) {
            title = i18n.getMessage('Missing dependency');
            hint = i18n.getMessage('The widget references a module or global that is not available in this environment. Check the component imports.');
        } else if (errMsg.includes('define timeout')) {
            title = i18n.getMessage('Widget timed out');
            hint = i18n.getMessage('The widget code loaded but never registered its custom element. This is usually caused by a missing dependency or a syntax error in the component class.');
        } else if (errMsg.includes('Failed to import') || errMsg.includes('Failed to fetch')) {
            title = i18n.getMessage('Import failed');
            hint = i18n.getMessage('Could not fetch the widget bundle. The widget may not be saved yet or the server returned an error.');
        } else if (errMsg.includes('registration failed')) {
            title = i18n.getMessage('Registration error');
            hint = i18n.getMessage('The widget attempted to register its element but threw an error. Check the component code for issues.');
        }
        return { title, hint, detail: errMsg };
    }

    /**
     * Render the error fallback as a Lit template (used inside render()).
     */
    _renderErrorFallback() {
        const err = this._previewError;
        if (!err) return nothing;
        return html`
            <div class="preview-error">
                <div class="preview-error-icon">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <p class="preview-error-title">${err.title}</p>
                ${err.hint ? html`<p class="preview-error-hint">${err.hint}</p>` : nothing}
                <details class="preview-error-detail">
                    <summary>${i18n.getMessage('Error details')}</summary>
                    <code>${err.detail}</code>
                </details>
                <button class="preview-error-retry" @click=${() => this.refresh()}>${i18n.getMessage('Retry')}</button>
            </div>
        `;
    }

    /**
     * Reload the preview with fresh widget code.
     */
    refresh({ showLoader = false } = {}) {
        if (!this.widgetId) return;
        if (showLoader) {
            this._loading = true;
        }
        this._loadScopedWidget();
    }

    /**
     * Reload preview after source was saved to DB by the chat.
     */
    refreshFromSource(_componentSource, { showLoader = false } = {}) {
        this.refresh({ showLoader });
    }

    /**
     * Get the widget element inside the preview shadow.
     * @returns {HTMLElement|null}
     */
    getWidgetElement() {
        const container = this.renderRoot?.querySelector('.preview-host');
        return container?.firstElementChild || null;
    }

    /**
     * Set properties on the widget element and trigger server script refresh.
     * @param {Object} props - key/value pairs to set on the widget element
     * @returns {number} number of properties successfully applied
     */
    setWidgetProperties(props) {
        if (!this.widgetId || !props) return 0;

        const widgetEl = this.getWidgetElement();
        if (!widgetEl) return 0;

        let applied = 0;
        Object.entries(props).forEach(([key, val]) => {
            try {
                widgetEl[key] = val;
                applied++;
            } catch (err) {
                console.warn('[Preview] Failed to set "' + key + '" on <' + this.widgetId + '>:', err);
            }
        });

        // Trigger server script refresh so widget fetches new data with updated props
        if (applied > 0 && widgetEl.server?.update) {
            widgetEl.server.update().catch(() => {});
        }

        return applied;
    }

    _onWheel(e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            this._setZoom(this._zoom + delta);
        }
    }

    _setZoom(val) {
        this._zoom = Math.round(Math.max(0.25, Math.min(3, val)) * 100) / 100;
    }

    _zoomIn() {
        this._setZoom(this._zoom + 0.1);
    }

    _zoomOut() {
        this._setZoom(this._zoom - 0.1);
    }

    _zoomReset() {
        this._zoom = 1;
    }

    // -----------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------
    _getDragOverlayCursor() {
        const mode = this._resizeMode;
        if (mode === 'left' || mode === 'right') return 'ew';
        if (mode === 'bottom') return 'ns';
        if (mode === 'corner') return 'nwse';
        return 'ew';
    }

    // -----------------------------------------------------------
    // Render
    // -----------------------------------------------------------
    render() {
        return html`
            ${this._renderPreviewArea()}
            ${this._isResizing ? html`<div class="drag-overlay ${this._getDragOverlayCursor()}"></div>` : nothing}
        `;
    }

    _renderZoomPill() {
        const zoomPct = Math.round(this._zoom * 100);
        return html`
            <div class="zoom-pill">
                <button class="aiux-btn aiux-btn-ghost aiux-btn-circle aiux-btn-xs aiux-tooltip aiux-tooltip-top" data-tip="${i18n.getMessage('Zoom out')}" @click=${() => this._zoomOut()}><aiux-icon name="minus-outline" size="xs"></aiux-icon></button>
                <span
                    class="zoom-pill-label aiux-tooltip aiux-tooltip-top"
                    @click=${() => this._zoomReset()}
                    data-tip="${i18n.getMessage('Reset zoom')}"
                >${zoomPct}%</span>
                <button class="aiux-btn aiux-btn-ghost aiux-btn-circle aiux-btn-xs aiux-tooltip aiux-tooltip-top" data-tip="${i18n.getMessage('Zoom in')}" @click=${() => this._zoomIn()}><aiux-icon name="plus-outline" size="xs"></aiux-icon></button>
            </div>
        `;
    }

    _renderSkeleton(animated = false) {
        return html`
            <div class="loading-overlay">
                <div class="skeleton-layout${animated ? ' animated' : ''}">
                    <div class="skeleton-top">
                        <div class="skeleton-lines">
                            <div class="skeleton-line skeleton-line--long"></div>
                            <div class="skeleton-line skeleton-line--med"></div>
                        </div>
                        <div class="skeleton-thumb"></div>
                    </div>
                    <div class="skeleton-bottom">
                        <div class="skeleton-line skeleton-line--short1"></div>
                        <div class="skeleton-line skeleton-line--short2"></div>
                    </div>
                </div>
            </div>
        `;
    }

    _renderPreviewArea() {
        // Show centered loader during API call (both creation and update)
        if (this._loading && this.widgetId) {
            return html`
                <div class="centered-loader">
                    <aiux-loader .animationConfig=${ARC_SPINNER_CONFIG} size="xl" ></aiux-loader>
                </div>
            `;
        }

        if (!this.widgetId) {
            return html`
                <div class="preview-wrapper">
                    <div class="viewport-container" style="zoom: ${this._zoom};">
                        <div class="preview-empty">
                            <aiux-icon name="eye-slash-outline" size="lg" class="preview-empty-icon"></aiux-icon>
                            <span class="preview-empty-text">${i18n.getMessage('Save the widget first to preview it')}</span>
                        </div>
                    </div>
                </div>
                ${this._renderZoomPill()}
            `;
        }

        const frameClasses = `viewport-frame${this._isResizing ? ' resizing' : ''}`;

        return html`
            <div class="preview-wrapper">
                <div class="viewport-container" style="zoom: ${this._zoom};">
                    <div class="resize-layout" style="margin-bottom:calc(var(--spacing, 0.25rem) * 5);">
                        <!-- Left handle -->
                        <div
                            class="resize-handle-h ${this._resizeMode === 'left' ? 'active' : ''}"
                            @mousedown=${(e) => this._onHandleMouseDown(e, 'left')}
                        >
                            <div class="grip-bar"></div>
                        </div>

                        <!-- Viewport frame -->
                        <div
                            class="${frameClasses}"
                            style="width:${this._viewportWidth ? this._viewportWidth + 'px' : 'auto'}; height:${this._viewportHeight ? this._viewportHeight + 'px' : 'auto'}; position:relative;"
                        >
                            ${this.placeholder ? html`
                                ${this._renderSkeleton()}
                            ` : this._previewError ? html`
                                ${this._renderErrorFallback()}
                            ` : html`
                                <div class="preview-host"></div>
                                ${this._refreshing ? this._renderSkeleton(true) : nothing}
                            `}
                        </div>

                        <!-- Right handle -->
                        <div
                            class="resize-handle-h ${this._resizeMode === 'right' ? 'active' : ''}"
                            @mousedown=${(e) => this._onHandleMouseDown(e, 'right')}
                        >
                            <div class="grip-bar"></div>
                        </div>

                        <!-- Bottom handle -->
                        <div
                            class="resize-handle-v ${this._resizeMode === 'bottom' ? 'active' : ''}"
                            @mousedown=${(e) => this._onHandleMouseDown(e, 'bottom')}
                        >
                            <div class="grip-bar-h"></div>
                        </div>

                        <!-- Corner handle -->
                        <div
                            class="resize-handle-corner ${this._resizeMode === 'corner' ? 'active' : ''}"
                            @mousedown=${(e) => this._onHandleMouseDown(e, 'corner')}
                        >
                            <div class="grip-corner"></div>
                        </div>
                    </div>
                </div>
            </div>
            ${this._renderZoomPill()}
        `;
    }

}
