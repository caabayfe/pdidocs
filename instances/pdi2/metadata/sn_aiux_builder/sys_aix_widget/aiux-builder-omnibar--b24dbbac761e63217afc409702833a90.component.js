import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { locationService, i18n } from '@servicenow/aiux-services';

class AiuxBuilderOmnibar extends AIUXWidgetElement {
	static properties = {
		/**
		 * 'compact' — single-row pill (default)
		 * 'full'    — multi-row card with textarea, mic, include-web pill
		 */
		variant:     { type: String },
		placeholder: { type: String },
		widgetId:    { type: String, attribute: 'widget-id' },
		// ── internal state ──────────────────────────────────────────────
		_prompt:     { type: String,  state: true },
		_includeWeb: { type: Boolean, state: true },
		_listening:  { type: Boolean, state: true },
		_holdingMic: { type: Boolean, state: true },
		_isCreating: { type: Boolean, state: true },
		_submittedPrompt: { type: String, state: true },
		_currentScopeName: { type: String, state: true },
	};

	constructor() {
		super();
		this.variant     = 'compact';
		this.placeholder = '';        // falls back to per-variant default
		this.widgetId    = '';
		this._prompt     = '';
		this._includeWeb = true;
		this._listening  = false;
		this._holdingMic = false;
		this._isCreating = false;
		this._submittedPrompt = '';
		this._currentScopeName = '';
		this._handleScopeChange = (e) => {
			this._currentScopeName = e.detail?.name || '';
			this.requestUpdate();
		};
	}

	connectedCallback() {
		super.connectedCallback();
		window.addEventListener('wb-scope-change', this._handleScopeChange);
		if (!this._currentScopeName && window.AIUX_CURRENT_SCOPE?.name) {
			this._currentScopeName = window.AIUX_CURRENT_SCOPE.name;
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		window.removeEventListener('wb-scope-change', this._handleScopeChange);
	}

	// ── Computed placeholder ──────────────────────────────────────────────

	get _placeholder() {
		if (this.placeholder) return this.placeholder;
		return this.variant === 'full'
			? i18n.getMessage('Describe what you need — like \'an approval card with approve and reject buttons\'')
			: i18n.getMessage('Describe changes to this widget...');
	}

	get _entityService() {
		return window.aiuxBuilderEntityService;
	}

	// ── Handlers ──────────────────────────────────────────────────────────

	_handleInput(e) {
		this._prompt = e.target.value;
		this._autoResize(e.target);
	}

	_autoResize(el) {
		if (!el) return;
		// 4 lines max: line-height 1.5 * font-size ~14px = 21px per line → 84px
		const maxH = 84;
		el.style.height = 'auto';
		const newH = Math.min(el.scrollHeight, maxH);
		el.style.height = newH + 'px';
		el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
		// Adjust border-radius: pill when single line, rounded when multiline
		const isMultiline = el.scrollHeight > 30;
		const inner = el.closest('.omnibar-inner');
		const outer = el.closest('.omnibar');
		const radius = isMultiline ? 'var(--radius-2xl, 1rem)' : 'var(--radius-full, 9999px)';
		if (inner) inner.style.borderRadius = radius;
		if (outer) outer.style.borderRadius = radius;
	}

	_handleKeyDown(e) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			this._handleSend();
		}
	}

	async _handleSend() {
		// Prevent multiple submissions
		if (this._isCreating) return;
		
		const text = this._prompt.trim();
		if (!text) return;
		
		// Clear input immediately and reset height/radius
		const input = this.renderRoot.querySelector('.omnibar-input');
		const textarea = this.renderRoot.querySelector('.prompt-input');
		if (input) {
			input.value = '';
			input.style.height = 'auto';
			input.style.overflowY = 'hidden';
			const inner = input.closest('.omnibar-inner');
			const outer = input.closest('.omnibar');
			if (inner) inner.style.borderRadius = '';
			if (outer) outer.style.borderRadius = '';
		}
		if (textarea) { textarea.value = ''; textarea.style.height = 'auto'; }
		this._prompt = '';
		
		// Dispatch event — parent components (e.g. Chat Panel) listen for this
		this.dispatchEvent(new CustomEvent('wb-chat-submit', {
			detail: { prompt: text, includeWeb: this._includeWeb, variant: this.variant },
			bubbles: true, composed: true,
		}));

		// ── Compact mode: only dispatch event, parent handles the API call ──
		if (this.variant === 'compact') {
			return;
		}

		// ── Full mode: store prompt and navigate to editor immediately ──
		// Chat panel on the editor page will pick up the prompt and call createWidget
		try {
			sessionStorage.setItem('aiux-pending-prompt', text);
		} catch {}
		locationService.navigate('edit/widget/-1');
	}

	_toggleWeb() {
		this._includeWeb = !this._includeWeb;
	}

	_startMic(e) {
		if (e) e.preventDefault();
		if (this._listening) return;
		this._holdingMic = true;
		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			console.warn('SpeechRecognition API not supported in this browser.');
			return;
		}
		const recognition = new SpeechRecognition();
		recognition.lang = 'en-US';
		recognition.interimResults = true;
		recognition.continuous = true;
		recognition.maxAlternatives = 1;

		this._recognition = recognition;
		this._interimTranscript = '';
		this._basePrompt = this._prompt;

		recognition.onresult = (event) => {
			let interim = '';
			let final = '';
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) {
					final += transcript;
				} else {
					interim += transcript;
				}
			}
			if (final) {
				const separator = this._basePrompt && !this._basePrompt.endsWith(' ') ? ' ' : '';
				this._basePrompt = this._basePrompt + separator + final;
				this._prompt = this._basePrompt;
				this._interimTranscript = '';
			} else {
				const separator = this._basePrompt && !this._basePrompt.endsWith(' ') ? ' ' : '';
				this._prompt = this._basePrompt + separator + interim;
				this._interimTranscript = interim;
			}
			this._syncInputValue();
		};

		recognition.onend = () => {
			this._listening = false;
			this._recognition = null;
		};

		recognition.onerror = (event) => {
			if (event.error !== 'no-speech' && event.error !== 'aborted') {
				console.warn('Speech recognition error:', event.error);
			}
			this._listening = false;
			this._recognition = null;
		};

		recognition.start();
		this._listening = true;
		this.dispatchEvent(new CustomEvent('wb-mic-toggle', {
			detail: { listening: true },
			bubbles: true, composed: true,
		}));
	}

	_handleSendDown(e) {
		if (e) e.preventDefault();
		this._sendHoldTimer = setTimeout(() => {
			this._sendHoldTimer = null;
			this._startMic(e);
		}, 200);
	}

	_handleSendUp() {
		if (this._sendHoldTimer) {
			clearTimeout(this._sendHoldTimer);
			this._sendHoldTimer = null;
			this._handleSend();
			return;
		}
		this._stopListening();
	}

	_handleSendLeave() {
		if (this._sendHoldTimer) {
			clearTimeout(this._sendHoldTimer);
			this._sendHoldTimer = null;
		}
		this._stopListening();
	}

	_stopListening() {
		if (!this._holdingMic && !this._listening) return;
		this._holdingMic = false;
		if (this._recognition) {
			this._recognition.stop();
			this._recognition = null;
		}
		this._listening = false;
		this.dispatchEvent(new CustomEvent('wb-mic-toggle', {
			detail: { listening: false },
			bubbles: true, composed: true,
		}));
	}

	_syncInputValue() {
		const input = this.renderRoot.querySelector('.omnibar-input');
		const textarea = this.renderRoot.querySelector('.prompt-input');
		if (input) input.value = this._prompt;
		if (textarea) textarea.value = this._prompt;
	}

	// ── Icons ─────────────────────────────────────────────────────────────

	_iconPlus() {
		return html`<aiux-icon name="plus-outline" size="sm" class="icon-base-content"></aiux-icon>`;
	}

	_iconGlobe() {
		return html`<aiux-icon name="globe-outline" size="sm" class="icon-info"></aiux-icon>`;
	}

	_iconClose() {
		return html`<aiux-icon name="close-outline" size="xs" class="icon-info"></aiux-icon>`;
	}

	_iconMic() {
		const name = 'microphone';
		return html`<aiux-icon name="${name}" size="md" class="icon-base-content"></aiux-icon>`;
	}

	_iconSend() {
		return html`<aiux-icon name="send" size="md" class="icon-base-content"></aiux-icon>`;
	}

	// ── Shared sub-elements ───────────────────────────────────────────────

	_renderSubmittedMessage() {
		if (!this._submittedPrompt) return nothing;
		return html`
			<div class="submitted-thread">
				<!-- User message bubble -->
				<div class="user-bubble-row">
					<div class="user-bubble">
						${this._submittedPrompt}
					</div>
				</div>
				<!-- AI processing indicator -->
				${this._isCreating ? html`
					<div class="ai-indicator">
						<div class="ai-avatar">
							<aiux-icon name="ai-sparkle-outline" size="sm" class="icon-on-filled"></aiux-icon>
						</div>
						<div class="ai-label-group">
							<span class="ai-label">${i18n.getMessage('Building your widget...')}</span>
							<div class="dot-container">
								<span class="dot"></span>
								<span class="dot"></span>
								<span class="dot"></span>
							</div>
						</div>
					</div>
				` : nothing}
			</div>
		`;
	}

	_renderMicBtn() {
		const tipText = this._listening ? 'Listening...' : 'Hold to speak';
		return html`
			<button
				class="mic-btn ${this._listening ? 'mic-btn--listening' : ''}"
				@mousedown=${this._startMic}
				@mouseup=${this._stopListening}
				@mouseleave=${this._stopListening}
				@touchstart=${this._startMic}
				@touchend=${this._stopListening}
				aria-label="${i18n.getMessage('Hold to speak')}"
			>
				${this._iconMic()}
			</button>
		`;
	}

	_renderSendBtn(canSend) {
		const isDisabled = !canSend || this._isCreating;
		return html`
			<button
				class="send-btn ${canSend && !this._isCreating ? 'send-btn--active' : ''} aiux-tooltip aiux-tooltip-top"
				data-tip="${this._isCreating ? i18n.getMessage('Creating...') : i18n.getMessage('Submit prompt')}"
				?disabled=${isDisabled}
				@click=${this._handleSend}
				aria-label="${this._isCreating ? i18n.getMessage('Creating...') : i18n.getMessage('Submit prompt')}"
			>
				${this._isCreating ? html`<span>...</span>` : this._iconSend()}
			</button>
		`;
	}

	_renderCompactActionBtn(canSend) {
		if (this._isCreating) {
			return html`
				<button class="send-btn" disabled aria-label="${i18n.getMessage('Creating...')}">
					<span>...</span>
				</button>
			`;
		}
		const showMic = !canSend || this._holdingMic;
		if (showMic) {
			return html`
				<button
					class="send-btn ${this._listening ? 'send-btn--listening' : 'send-btn--active'} aiux-tooltip aiux-tooltip-top"
					data-tip="${this._listening ? i18n.getMessage('Listening...') : i18n.getMessage('Hold to speak')}"
					@mousedown=${this._startMic}
					@mouseup=${this._stopListening}
					@mouseleave=${this._stopListening}
					@touchstart=${this._startMic}
					@touchend=${this._stopListening}
					aria-label="${this._listening ? i18n.getMessage('Listening...') : i18n.getMessage('Hold to speak')}"
				>
					${this._iconMic()}
				</button>
			`;
		}
		return html`
			<button
				class="send-btn send-btn--active aiux-tooltip aiux-tooltip-top"
				data-tip="${i18n.getMessage('Submit prompt')}"
				@click=${this._handleSend}
				aria-label="${i18n.getMessage('Submit prompt')}"
			>
				${this._iconSend()}
			</button>
		`;
	}

	_renderContextPill() {

		return html`
			${this._currentScopeName ? html`
				<span class="aiux-badge aiux-badge-soft aiux-badge-info aiux-badge-md scope-pill">
				<span class="aiux-badge aiux-badge-primary aiux-badge-soft aiux-badge-sm gap-1">
					<aiux-icon name="globe-outline" size="xs"></aiux-icon>
					${this._currentScopeName}
				</span>
			` : nothing}
		`;
	}

	// ── Compact layout ────────────────────────────────────────────────────
	// Single-row pill: [+] [input·············] [send]

	_renderCompact() {
		const canSend = this._prompt.trim().length > 0;
		return html`
			<div class="omnibar omnibar--compact" role="search" aria-label="${i18n.getMessage('Chat prompt input')}">
				<div class="omnibar-inner">
					<textarea
						class="omnibar-input"
						rows="1"
						placeholder="${this._placeholder}"
						.value=${this._prompt}
						aria-label="${this._placeholder}"
						@input=${this._handleInput}
						@keydown=${this._handleKeyDown}
					></textarea>
					${this._renderCompactActionBtn(canSend)}
				</div>
			</div>
		`;
	}

	// ── Full layout ───────────────────────────────────────────────────────
	// Multi-row card:
	//   [textarea                        ]
	//   [+] [Include web ×]   [mic] [send]

	_renderFull() {
		const canSend = this._prompt.trim().length > 0;
		return html`
			<div class="omnibar omnibar--full" role="search" aria-label="${i18n.getMessage('AI prompt input')}">
				${this._renderSubmittedMessage()}
				<div class="omnibar-inner">
					<div class="input-area">
						<textarea
							class="prompt-input"
							.value=${this._prompt}
							placeholder="${this._placeholder}"
							rows="1"
							aria-label="${this._placeholder}"
							@input=${this._handleInput}
							@keydown=${this._handleKeyDown}
						></textarea>
					</div>
					<div class="action-row">
						<div class="actions-left">
							${this._renderContextPill()}
						</div>
						<div class="actions-right">
							${this._renderCompactActionBtn(canSend)}
						</div>
					</div>
				</div>
			</div>
		`;
	}

	// ── Root ──────────────────────────────────────────────────────────────

	render() {
		return html`
			<div class="root">
				${this.variant === 'full' ? this._renderFull() : this._renderCompact()}
				<span class="disclaimer">${i18n.getMessage('Some answers generated by AI. Be sure to check for accuracy.')}</span>
			</div>
		`;
	}

	// ── Styles ────────────────────────────────────────────────────────────

	static styles = css`
		:host {
			display: block;
			width: 100%;
			font-family: var(--font-sans, Inter);
		}

		.root {
			display: flex;
			flex-direction: column;
			width: 100%;
			box-sizing: border-box;
		}

		/* ═══════════════════════════════════════════════════════════════════
		   SHARED — applies to both variants
		═══════════════════════════════════════════════════════════════════ */

		.omnibar {
			width: 100%;
			background: var(--color-base-200, #f3f4f6);
			padding: calc(var(--spacing, 0.25rem) * 1.5);
			box-sizing: border-box;
		}

		.omnibar-inner {
			background: var(--color-base-100, #ffffff);
		}

		/* ═══════════════════════════════════════════════════════════════════
		   COMPACT — single-row pill
		   Outer: border-radius 100px
		   Inner: border-radius 100px, 64px tall, flex-row
		═══════════════════════════════════════════════════════════════════ */

		.omnibar--compact {
			border-radius: var(--radius-full, 9999px);
			box-shadow: var(--shadow-lg);
		}

		.omnibar--compact .omnibar-inner {
			border-radius: var(--radius-full, 9999px);
			display: flex;
			flex-direction: row;
			align-items: center;
			min-height: calc(var(--spacing, 0.25rem) * 14);
			padding: calc(var(--spacing, 0.25rem) * 2.5) calc(var(--spacing, 0.25rem) * 2) calc(var(--spacing, 0.25rem) * 2.5) calc(var(--spacing, 0.25rem) * 4);
			gap: calc(var(--spacing, 0.25rem) * 2);
		}

		/* ═══════════════════════════════════════════════════════════════════
		   FULL — multi-row rounded card
		   Outer: border-radius 18px, max-width 765px
		   Inner: border-radius 13px, flex-col
		═══════════════════════════════════════════════════════════════════ */

		.omnibar--full {
			border-radius: var(--radius-2xl, 1rem);
			max-width: 765px;
			box-shadow: var(--shadow-md, 0 2px 16px rgba(0, 0, 0, 0.07));
		}

		.omnibar--full .omnibar-inner {
			border-radius: var(--radius-xl, 0.75rem);
			display: flex;
			flex-direction: column;
		}

		/* ── Textarea (full only) ────────────────────────────────────────── */
		.input-area {
			padding: calc(var(--spacing, 0.25rem) * 4) calc(var(--spacing, 0.25rem) * 4) calc(var(--spacing, 0.25rem) * 1);
		}

		.prompt-input {
			width: 100%;
			border: none;
			outline: none;
			resize: none;
			font-family: inherit;
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content, #1f2937);
			background: transparent;
			line-height: var(--leading-normal, 1.5);
			box-sizing: border-box;
			min-height: calc(var(--leading-normal, 1.5) * var(--text-sm, 0.875rem) * 2);
			max-height: calc(var(--leading-normal, 1.5) * var(--text-sm, 0.875rem) * 8);
			overflow-y: auto;
		}
		.prompt-input::placeholder { color: var(--color-base-content-secondary, #6b7280); }

		/* ── Action row (full only) ──────────────────────────────────────── */
		.action-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: calc(var(--spacing, 0.25rem) * 1) calc(var(--spacing, 0.25rem) * 2.5) calc(var(--spacing, 0.25rem) * 2.5);
			gap: calc(var(--spacing, 0.25rem) * 2);
		}

		.actions-left {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1.5);
			flex: 1;
			min-width: 0;
		}

		.actions-right {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1);
			flex-shrink: 0;
		}

		/* ── Single-row input (compact only) ─────────────────────────────── */
		.omnibar-input {
			flex: 1;
			min-width: 0;
			border: none;
			outline: none;
			font-family: inherit;
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content, #1f2937);
			background: transparent;
			resize: none;
			overflow-y: hidden;
			line-height: 1.5;
			padding: calc(var(--spacing, 0.25rem) * 1) 0;
			margin: 0;
		}
		.omnibar-input::placeholder { color: var(--color-base-content-secondary, #6b7280); }


		/* ── Scope pill (uses aiux-badge) ──────────────────────────────────── */
		.scope-pill {
			white-space: nowrap;
			font-weight: var(--font-weight-medium, 500);
		}

		.add-web-btn {
			display: inline-flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1.25);
			height: calc(var(--spacing, 0.25rem) * 7.5);
			padding: 0 calc(var(--spacing, 0.25rem) * 2.5);
			background: transparent;
			border: 1px dashed var(--color-info, #0ea5e9);
			border-radius: var(--radius-lg, 0.5rem);
			cursor: pointer;
			white-space: nowrap;
			transition: background 0.15s var(--ease-out, ease);
		}
		.add-web-btn:hover { background: color-mix(in srgb, var(--color-info, #0ea5e9) 5%, transparent); }

		.pill-label {
			font-size: var(--text-xs, 0.8125rem);
			font-weight: var(--font-weight-medium, 500);
			color: var(--color-info, #0ea5e9);
		}
		.pill-remove {
			display: flex;
			align-items: center;
			justify-content: center;
			width: calc(var(--spacing, 0.25rem) * 4.5);
			height: calc(var(--spacing, 0.25rem) * 4.5);
			border: none;
			background: transparent;
			cursor: pointer;
			border-radius: var(--radius-sm, 0.25rem);
			padding: 0;
			transition: background 0.12s var(--ease-out, ease);
		}
		.pill-remove:hover { background: color-mix(in srgb, var(--color-info, #0ea5e9) 15%, transparent); }

		/* ── Send button (shared) ────────────────────────────────────────── */
		.send-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: calc(var(--spacing, 0.25rem) * 10);
			height: calc(var(--spacing, 0.25rem) * 10);
			min-width: calc(var(--spacing, 0.25rem) * 10);
			border-radius: var(--radius-full, 9999px);
			border: none;
			background: color-mix(in srgb, var(--accent-200) 30%, transparent);
			cursor: not-allowed;
			transition: background 0.15s var(--ease-out, ease), opacity 0.15s var(--ease-out, ease);
			flex-shrink: 0;
		}
		.send-btn .icon-base-content { color: var(--accent-500); }
		.send-btn--active {
			background: var(--accent-200);
			cursor: pointer;
		}
		.send-btn--active .icon-base-content { color: var(--accent-600); }
		.send-btn--active:hover { opacity: 0.88; }
		.send-btn:focus-visible { outline: 2px solid var(--accent-200); outline-offset: 2px; }
		.send-btn:disabled { pointer-events: none; }

		/* ── Mic listening state ──────────────────────────────────────────── */
		.send-btn--listening {
			background: var(--color-error, #ef4444);
			cursor: pointer;
			animation: micPulse 1.5s ease infinite;
		}
		.send-btn--listening .icon-base-content { color: var(--color-base-100, #ffffff); }
		.mic-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: calc(var(--spacing, 0.25rem) * 10);
			height: calc(var(--spacing, 0.25rem) * 10);
			min-width: calc(var(--spacing, 0.25rem) * 10);
			border-radius: var(--radius-full, 9999px);
			border: none;
			background: transparent;
			cursor: pointer;
			transition: background 0.15s var(--ease-out, ease);
			flex-shrink: 0;
		}
		.mic-btn:hover { background: var(--color-base-200, #f3f4f6); }
		.mic-btn--listening {
			background: var(--color-error, #ef4444);
			animation: micPulse 1.5s ease infinite;
		}
		.mic-btn--listening:hover { background: var(--color-error, #ef4444); opacity: 0.88; }
		.mic-btn--listening .icon-base-content { color: var(--color-base-100, #ffffff); }

		@keyframes micPulse {
			0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-error, #ef4444) 40%, transparent); }
			50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--color-error, #ef4444) 0%, transparent); }
		}

		/* ── Animations ──────────────────────────────────────────────────── */
		@keyframes fadeInUp {
			from {
				opacity: 0;
				transform: translateY(10px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		@keyframes pulse {
			0%, 100% {
				opacity: 1;
				transform: scale(1);
			}
			50% {
				opacity: 0.8;
				transform: scale(1.05);
			}
		}

		@keyframes dotPulse {
			0%, 80%, 100% {
				opacity: 0.3;
				transform: scale(0.8);
			}
			40% {
				opacity: 1;
				transform: scale(1.2);
			}
		}

		/* ── Icon classes ────────────────────────────────────────────────── */
		.icon-base-content { color: var(--color-base-content, #343332); }
		.icon-info { color: var(--color-info, #007b9e); }
		.icon-on-filled { color: white; }

		/* ── Submitted message thread ────────────────────────────────────── */
		.submitted-thread {
			display: flex; flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 3);
			margin-bottom: calc(var(--spacing, 0.25rem) * 4);
			animation: fadeInUp 0.3s var(--ease-out, ease);
		}
		.user-bubble-row { display: flex; justify-content: flex-end; }
		.user-bubble {
			max-width: 80%;
			padding: calc(var(--spacing, 0.25rem) * 3) calc(var(--spacing, 0.25rem) * 4);
			background: color-mix(in srgb, var(--color-primary, #3b82f6) 10%, transparent);
			border: 1px solid color-mix(in srgb, var(--color-primary, #3b82f6) 20%, transparent);
			border-radius: var(--radius-2xl, 1rem) var(--radius-2xl, 1rem) var(--radius-sm, 0.25rem) var(--radius-2xl, 1rem);
			font-size: var(--text-sm, 0.875rem);
			line-height: 1.5;
		}
		.ai-indicator {
			display: flex; align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2.5);
			padding: calc(var(--spacing, 0.25rem) * 3) calc(var(--spacing, 0.25rem) * 4);
			max-width: 300px;
		}
		.ai-avatar {
			width: calc(var(--spacing, 0.25rem) * 7); height: calc(var(--spacing, 0.25rem) * 7);
			border-radius: var(--radius-full, 9999px);
			background: linear-gradient(135deg, #4da8be, #7ec4d6);
			display: flex; align-items: center; justify-content: center;
			animation: pulse 2s var(--ease-out, ease) infinite;
		}
		.ai-label-group {
			display: flex; flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 1);
		}
		.ai-label {
			font-size: var(--text-sm, 0.875rem);
			font-weight: var(--font-weight-medium, 500);
		}
		.dot-container {
			display: flex;
			gap: calc(var(--spacing, 0.25rem) * 1);
		}
		.dot {
			width: calc(var(--spacing, 0.25rem) * 1.5); height: calc(var(--spacing, 0.25rem) * 1.5);
			border-radius: var(--radius-full, 9999px);
			background: #4da8be;
			animation: dotPulse 1.4s ease infinite;
		}
		.dot:nth-child(2) { animation-delay: 0.2s; }
		.dot:nth-child(3) { animation-delay: 0.4s; }

		/* ── Disclaimer ─────────────────────────────────────────────────── */
		.disclaimer {
			display: block;
			margin: calc(var(--spacing, 0.25rem) * 1.5) 0 0;
			text-align: center;
			font-size: var(--text-xs, 0.75rem);
			color: var(--color-base-content-secondary, #656462);
			line-height: 1.4;
		}

		/* ── Reduced motion ──────────────────────────────────────────────── */
		@media (prefers-reduced-motion: reduce) {
			.add-web-btn, .send-btn { transition: none; }
			* { animation: none !important; }
		}

	`;
}
