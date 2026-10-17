import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n } from '@servicenow/aiux-services';

// ---------------------------------------------------------------------------
// CodeMirror 6 Bundle
// ---------------------------------------------------------------------------
// CM6 is loaded via the sys_aix_dependency bundle (AIUX_CodeMirror_6).
// Autocomplete is provided via AIUX_Code_Intellisense dependency.
// Both are accessed via this.deps.services instead of window.NOW.aiux.
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// AiuxBuilderDsCodeEditor
// ---------------------------------------------------------------------------
// Layer 1 Design System widget -- reusable code editor.
//
// Props:
//   value (String)       - document content
//   language (String)    - javascript | json | html | css | xml
//   theme (String)       - dark | light
//   read-only (Boolean)  - prevent edits
//   placeholder (String) - placeholder text
//   line-numbers (Bool)  - show line numbers (default true)
//   line-wrapping (Bool) - soft-wrap long lines (default false)
//   tab-size (Number)    - indent width (default 2)
//
// Events:
//   @ds-change   { value }         - content changed
//   @ds-focus    {}                 - editor focused
//   @ds-blur     {}                 - editor blurred
//   @ds-ready    { editor }        - editor instance ready
// ---------------------------------------------------------------------------
class AiuxBuilderDsCodeEditor extends AIUXWidgetElement {
    static styles = css`

        :host {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 120px;
            position: relative;
            font-family: var(--font-servicenow, 'Servicenow Sans', sans-serif);
        }

        .editor-wrapper {
            width: 100%;
            height: 100%;
            /* border-radius: var(--radius-xl, 0.75rem); */
            overflow: hidden;
            border: 1px solid var(--color-base-300, #cbd5e1);
            background: var(--color-base-100, #ffffff);
        }

        .editor-host {
            width: 100%;
            height: 100%;
        }

        /* CM6 overrides inside shadow DOM */
        .editor-host .cm-editor {
            height: 100%;
            outline: none;
            font-size: var(--text-sm, 0.875rem);
        }

        .editor-host .cm-editor.cm-focused {
            outline: none;
        }

        .editor-host .cm-scroller {
            overflow: auto;
            font-family: 'SFMono-Regular', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
            font-size: var(--text-sm, 0.875rem);
            line-height: 1.6;
        }

        .editor-host .cm-gutters {
            border-inline-end: 1px solid var(--color-base-200, #e2e8f0);
        }

        /* Loading overlay */
        .loading-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: calc(var(--spacing, 0.25rem) * 3);
            background: var(--color-base-100, #ffffff);
            border-radius: var(--radius-xl, 0.75rem);
            z-index: 10;
        }

        .loading-text {
            font-size: var(--text-xs, 0.75rem);
            color: var(--color-base-content-secondary, #64748b);
        }

        /* Error state */
        .error-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: calc(var(--spacing, 0.25rem) * 2);
            padding: calc(var(--spacing, 0.25rem) * 6);
            background: var(--color-base-100, #ffffff);
            border-radius: var(--radius-xl, 0.75rem);
            z-index: 10;
        }

        .error-icon {
            width: calc(var(--spacing, 0.25rem) * 8);
            height: calc(var(--spacing, 0.25rem) * 8);
            color: var(--color-error, #ef4444);
        }

        .error-msg {
            font-size: var(--text-sm, 0.875rem);
            color: var(--color-base-content-secondary, #64748b);
            text-align: center;
            max-width: 300px;
        }

        wb-ds-button {
            margin-top: calc(var(--spacing, 0.25rem) * 2);
        }

        /* Hover signature tooltips */
        .sig-tooltip {
            font-family: 'SFMono-Regular', 'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace;
            font-size: var(--text-xs, 0.75rem);
            line-height: 1.5;
            padding: calc(var(--spacing, 0.25rem) * 2) calc(var(--spacing, 0.25rem) * 3);
            max-width: 480px;
        }
        .sig-line { white-space: pre-wrap; }
        .sig-name { color: #61afef; font-weight: var(--font-weight-semibold, 600); }
        .sig-paren { color: #abb2bf; }
        .sig-param { color: #e5c07b; }
        .sig-param-opt { color: #e5c07b; font-style: italic; opacity: 0.8; }
        .sig-sep { color: #abb2bf; }
        .sig-return { color: #98c379; margin-inline-start: calc(var(--spacing, 0.25rem) * 1); }
        .sig-type { color: #98c379; }
        .sig-desc {
            color: #7f848e;
            font-family: var(--font-servicenow, 'Servicenow Sans', sans-serif);
            font-size: var(--text-xs, 0.75rem);
            margin-top: calc(var(--spacing, 0.25rem) * 1);
            border-top: 1px solid #3e4451;
            padding-top: calc(var(--spacing, 0.25rem) * 1);
        }
        .sig-params-list {
            margin-top: calc(var(--spacing, 0.25rem) * 1);
            padding-top: calc(var(--spacing, 0.25rem) * 1);
            border-top: 1px solid #3e4451;
            font-size: var(--text-xs, 0.75rem);
            color: #abb2bf;
        }
        .sig-params-list > div { margin: calc(var(--spacing, 0.25rem) * 0.5) 0; }
        /* Signature help – active parameter */
        .sig-param-active {
            color: #e5c07b;
            font-weight: var(--font-weight-bold, 700);
            text-decoration: underline;
            text-underline-offset: 2px;
        }
        .sig-active-desc {
            margin-top: calc(var(--spacing, 0.25rem) * 1);
            padding-top: calc(var(--spacing, 0.25rem) * 1);
            border-top: 1px solid #3e4451;
            font-size: var(--text-xs, 0.75rem);
            color: #abb2bf;
        }

    `;

    static dependencies = ['AIUX_CodeMirror_6', 'AIUX_Code_Intellisense'];

    static properties = {
        value:        { type: String },
        language:     { type: String },
        theme:        { type: String, reflect: true },
        readOnly:     { type: Boolean, attribute: 'read-only' },
        placeholder:  { type: String },
        lineNumbers:  { type: Boolean, attribute: 'line-numbers' },
        lineWrapping: { type: Boolean, attribute: 'line-wrapping' },
        tabSize:      { type: Number, attribute: 'tab-size' },
        scriptMode:   { type: String, attribute: 'script-mode' },
        instanceWidgets: { type: Array },
        _loading:     { type: Boolean, state: true },
        _error:       { type: String, state: true },
    };

    constructor() {
        super();
        this.value = '';
        this.language = 'javascript';
        this.theme = document.body?.getAttribute('data-theme') || 'light';
        this.readOnly = false;
        this.placeholder = '';
        this.lineNumbers = true;
        this.lineWrapping = false;
        this.tabSize = 2;
        this.scriptMode = 'component';
        this.instanceWidgets = [];
        this._loading = true;
        this._error = null;
        this._view = null;
        this._cm6 = null;
        this._internalChange = false;
        // Compartments for dynamic reconfiguration
        this._langConf = null;
        this._themeConf = null;
        this._readOnlyConf = null;
        this._acConf = null;
    }

    // -------------------------------------------------------------------
    // Language resolution
    // -------------------------------------------------------------------
    _getLanguageExtension(lang) {
        if (!this._cm6) return [];
        return this._cm6.javascript();
    }

    _getAcExtension() {
        if (!this._cm6) return [];
        var isServer = this.scriptMode === 'server';
        var instanceWidgets = this.instanceWidgets || [];
        return this._cm6.autocompletion({
            override: [function(ctx) { return this.deps.services.AIUX_Code_Intellisense?.completionSource?.(ctx, isServer, instanceWidgets); }.bind(this)],
            activateOnTypingDelay: 100,
        });
    }

    _getThemeExtension(theme) {
        if (!this._cm6) return [];
        return theme === 'dark' ? this._cm6.oneDark : [];
    }

    // -------------------------------------------------------------------
    // Build extensions
    // -------------------------------------------------------------------
    _buildExtensions() {
        const cm = this._cm6;
        if (!cm) return [];

        const exts = [];

        // Line numbers
        if (this.lineNumbers) {
            exts.push(cm.lineNumbers());
            exts.push(cm.highlightActiveLineGutter());
        }

        // Core
        exts.push(cm.highlightSpecialChars());
        exts.push(cm.history());
        exts.push(cm.foldGutter());
        exts.push(cm.drawSelection());
        exts.push(cm.dropCursor());
        exts.push(cm.EditorState.allowMultipleSelections.of(true));
        exts.push(cm.indentOnInput());
        exts.push(cm.indentUnit.of(' '.repeat(this.tabSize)));
        exts.push(cm.syntaxHighlighting(cm.defaultHighlightStyle, { fallback: true }));
        exts.push(cm.bracketMatching());
        exts.push(cm.closeBrackets());

        // AIX-aware autocomplete (in compartment for scriptMode switching)
        exts.push(this._acConf.of(this._getAcExtension()));

        // HTML tag auto-close: typing > after <tagname inserts </tagname> (component scripts only)
        if (this.scriptMode !== 'server' && cm.EditorView && cm.EditorView.inputHandler) {
            exts.push(cm.EditorView.inputHandler.of(function(view, from, to, text) {
                if (text !== '>') return false;
                var pos = view.state.selection.main.head;
                var lookBack = Math.max(0, pos - 200);
                var before = view.state.doc.sliceString(lookBack, pos);
                // Match an unclosed opening tag immediately before cursor:
                // <tagname or <tagname attr="val" etc. — no closing > yet
                var m = before.match(/<([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^>]*)?\s*$/);
                if (!m) return false;
                if (/\/\s*$/.test(before)) return false; // self-closing tag, don't auto-close
                var tagName = m[1];
                var VOID = { area:1,base:1,br:1,col:1,embed:1,hr:1,img:1,input:1,link:1,meta:1,param:1,source:1,track:1,wbr:1 };
                if (VOID[tagName.toLowerCase()]) return false;
                // Insert > + closing tag, cursor stays between them
                var closeTag = '</' + tagName + '>';
                view.dispatch({
                    changes: { from: pos, to: to, insert: '>' + closeTag },
                    selection: { anchor: pos + 1 },
                });
                return true;
            }));
        }

        // Hover signature tooltips
        exts.push(cm.hoverTooltip(function(view, pos) {
            var line = view.state.doc.lineAt(pos);
            var text = line.text;
            var lineFrom = line.from;
            var relPos = pos - lineFrom;

            // Expand outward from cursor to find dotted identifier (e.g. "i18n.getMessage")
            var start = relPos;
            var end = relPos;
            while (start > 0 && /[\w.$]/.test(text[start - 1])) start--;
            while (end < text.length && /[\w$]/.test(text[end])) end++;
            if (start === end) return null;

            var token = text.substring(start, end);
            var item = window.NOW?.aiux?.ac?.HOVER_MAP?.[token];
            if (!item) {
                // Try short name after last dot
                var lastDot = token.lastIndexOf('.');
                if (lastDot > -1) {
                    item = window.NOW?.aiux?.ac?.HOVER_MAP?.[token.substring(lastDot + 1)];
                }
            }
            if (!item) return null;

            return {
                pos: lineFrom + start,
                end: lineFrom + end,
                above: true,
                create: function() { return { dom: window.NOW?.aiux?.ac?.buildTooltipDOM?.(item) }; }
            };
        }, { hoverTime: 600 }));

        // Signature help – parameter hints inside parentheses
        const sigHelp = window.NOW?.aiux?.ac?.createSignatureHelpField?.(cm);
        if (sigHelp) exts.push(sigHelp);

        exts.push(cm.rectangularSelection());
        exts.push(cm.crosshairCursor());
        exts.push(cm.highlightActiveLine());

        // Search
        if (cm.search) exts.push(cm.search());
        if (cm.highlightSelectionMatches) exts.push(cm.highlightSelectionMatches());

        // Lint - uses CodeMirror's JavaScript parser (acorn-based) to detect syntax errors
        if (cm.linter && cm.javascript) {
            exts.push(cm.linter(function(view) {
                var diagnostics = [];
                var tree = cm.javascript().language.parser.parse(view.state.doc.toString());
                
                // Check for error nodes in the syntax tree
                var cursor = tree.cursor();
                do {
                    if (cursor.type.isError) {
                        var from = cursor.from;
                        var to = cursor.to;
                        
                        diagnostics.push({
                            from: from,
                            to: to,
                            severity: 'error',
                            message: 'Syntax error',
                        });
                    }
                } while (cursor.next());
                
                return diagnostics;
            }));
        }

        // Line wrapping
        if (this.lineWrapping) {
            exts.push(cm.EditorView.lineWrapping);
        }

        // Placeholder
        if (this.placeholder) {
            exts.push(cm.placeholder(this.placeholder));
        }

        // Keymaps
        exts.push(cm.keymap.of([
            ...cm.closeBracketsKeymap,
            ...cm.defaultKeymap,
            ...cm.historyKeymap,
            ...cm.foldKeymap,
            ...cm.completionKeymap,
            ...cm.lintKeymap,
            ...(cm.searchKeymap || []),
            { key: 'Tab', run: cm.acceptCompletion },
            cm.indentWithTab,
        ]));

        // Dynamic compartments
        exts.push(this._langConf.of(this._getLanguageExtension(this.language)));
        exts.push(this._themeConf.of(this._getThemeExtension(this.theme)));
        exts.push(this._readOnlyConf.of(cm.EditorState.readOnly.of(this.readOnly)));

        // Change listener
        exts.push(cm.EditorView.updateListener.of((update) => {
            if (update.docChanged) {
                this._internalChange = true;
                const newVal = update.state.doc.toString();
                this.value = newVal;
                this.dispatchEvent(new CustomEvent('ds-change', {
                    detail: { value: newVal },
                    bubbles: true,
                    composed: true,
                }));
                this._internalChange = false;
            }
            if (update.focusChanged) {
                const eventName = update.view.hasFocus ? 'ds-focus' : 'ds-blur';
                this.dispatchEvent(new CustomEvent(eventName, {
                    bubbles: true,
                    composed: true,
                }));
            }
        }));

        return exts;
    }

    // -------------------------------------------------------------------
    // Lifecycle
    // -------------------------------------------------------------------
    async firstUpdated() {
        await this._initEditor();

        // Auto-sync theme from platform (data-theme on document.body)
        this._themeObserver = new MutationObserver(() => {
            const bodyTheme = document.body.getAttribute('data-theme') || 'light';
            if (bodyTheme !== this.theme) {
                this.theme = bodyTheme;
            }
        });
        this._themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    }

    updated(changed) {
        if (!this._view || !this._cm6) return;

        // Sync value from outside
        if (changed.has('value') && !this._internalChange) {
            const newVal = (typeof this.value === 'string' ? this.value : '') || '';
            const current = this._view.state.doc.toString();
            if (newVal !== current) {
                this._view.dispatch({
                    changes: { from: 0, to: this._view.state.doc.length, insert: newVal },
                });
            }
        }

        // Reconfigure language
        if (changed.has('language') && this._langConf) {
            this._view.dispatch({
                effects: this._langConf.reconfigure(this._getLanguageExtension(this.language)),
            });
        }

        // Reconfigure theme
        if (changed.has('theme') && this._themeConf) {
            this._view.dispatch({
                effects: this._themeConf.reconfigure(this._getThemeExtension(this.theme)),
            });
        }

        // Reconfigure autocomplete (scriptMode or instanceWidgets changed)
        if ((changed.has('scriptMode') || changed.has('instanceWidgets')) && this._acConf) {
            this._view.dispatch({
                effects: this._acConf.reconfigure(this._getAcExtension()),
            });
        }

        // Reconfigure readOnly
        if (changed.has('readOnly') && this._readOnlyConf) {
            this._view.dispatch({
                effects: this._readOnlyConf.reconfigure(
                    this._cm6.EditorState.readOnly.of(this.readOnly)
                ),
            });
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._cm6PollInterval) {
            clearInterval(this._cm6PollInterval);
            this._cm6PollInterval = null;
        }
        if (this._themeObserver) {
            this._themeObserver.disconnect();
            this._themeObserver = null;
        }
        if (this._view) {
            this._view.destroy();
            this._view = null;
        }
    }

    // -------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------

    /** Get current document text */
    getValue() {
        return this._view?.state.doc.toString() ?? '';
    }

    /** Replace entire document */
    setValue(val) {
        if (!this._view) return;
        this._view.dispatch({
            changes: { from: 0, to: this._view.state.doc.length, insert: val || '' },
        });
    }

    /** Focus the editor */
    focus() {
        this._view?.focus();
    }

    /** Get the raw EditorView instance */
    getEditorView() {
        return this._view;
    }

    // -------------------------------------------------------------------
    // Retry on error
    // -------------------------------------------------------------------
    async _retry() {
        this._error = null;
        this._loading = true;
        // Destroy existing editor to prevent leaks
        if (this._view) {
            this._view.destroy();
            this._view = null;
        }
        await this._initEditor();
    }

    _waitForCM6() {
        return new Promise((resolve, reject) => {
            const cm6 = this.deps.services.AIUX_CodeMirror_6;
            if (cm6) return resolve(cm6);
            let attempts = 0;
            this._cm6PollInterval = setInterval(() => {
                const cm6Retry = this.deps.services.AIUX_CodeMirror_6;
                if (cm6Retry) {
                    clearInterval(this._cm6PollInterval);
                    resolve(cm6Retry);
                } else if (++attempts > 50) {
                    clearInterval(this._cm6PollInterval);
                    reject(new Error('CodeMirror bundle did not load in time'));
                }
            }, 100);
        });
    }

    async _initEditor() {
        try {
            this._loading = true;
            this._error = null;
            this._cm6 = await this._waitForCM6();

            // Create compartments
            this._langConf = new this._cm6.Compartment();
            this._themeConf = new this._cm6.Compartment();
            this._readOnlyConf = new this._cm6.Compartment();
            this._acConf = new this._cm6.Compartment();

            const host = this.shadowRoot.querySelector('.editor-host');
            if (!host) return;

            this._view = new this._cm6.EditorView({
                doc: (typeof this.value === 'string' ? this.value : '') || '',
                extensions: this._buildExtensions(),
                parent: host,
            });

            this._loading = false;

            this.dispatchEvent(new CustomEvent('ds-ready', {
                detail: { editor: this._view },
                bubbles: true,
                composed: true,
            }));
        } catch (err) {
            console.error('[CodeEditor] Failed to load CodeMirror:', err);
            this._loading = false;
            this._error = err.message || i18n.getMessage('Failed to load code editor');
        }
    }

    // -------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------
    render() {
        return html`
            <div class="editor-wrapper">
                <div class="editor-host" aria-label="Code editor"></div>
            </div>

            ${this._loading ? html`
                <div class="loading-overlay" role="status" aria-live="polite">
                    <span class="aiux-loading aiux-loading-spinner aiux-loading-md"></span>
                    <span class="loading-text">${i18n.getMessage('Loading editor...')}</span>
                </div>
            ` : nothing}

            ${this._error ? html`
                <div class="error-overlay" role="alert">
                    <aiux-icon name="circle-exclamation-outline" size="lg" class="error-icon"></aiux-icon>
                    <span class="error-msg">${this._error}</span>
                    <button class="aiux-btn aiux-btn-ghost aiux-btn-sm" @click=${this._retry}>${i18n.getMessage('Retry')}</button>
                </div>
            ` : nothing}
        `;
    }
}
