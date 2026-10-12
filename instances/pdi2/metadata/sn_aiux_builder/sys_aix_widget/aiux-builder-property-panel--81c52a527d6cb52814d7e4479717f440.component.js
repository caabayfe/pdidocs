import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n } from '@servicenow/aiux-services';


// ─────────────────────────────────────────────────────────────────────────────
// Default schema — mirrors the Figma "Widget properties" panel.
// Pass your own via the `schema` property to make it fully generic.
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_SCHEMA = [
	{
		key: 'name',
		label: 'Name',
		type: 'text',
		required: true,
		placeholder: 'Hello World',
		tooltip: 'Display name shown in the widget library',
	},
	{
		key: 'widgetId',
		label: 'Widget ID',
		type: 'text',
		required: true,
		placeholder: 'hello-world-playground',
		tooltip: 'Unique identifier used to reference this widget',
		helpText: 'Use lowercase letters, numbers and hyphens only',
	},
	{
		key: 'scope',
		label: 'Scope',
		type: 'select',
		required: true,
		tooltip: 'Determines where this widget can be used',
		options: [
			{ label: 'Global',      value: 'global' },
			{ label: 'Application', value: 'application' },
			{ label: 'Portal',      value: 'portal' },
		],
		defaultValue: 'global',
	},
	{
		key: 'description',
		label: 'Description',
		type: 'textarea',
		required: true,
		placeholder: 'A starter widget to experiment with. Edit the code and see live preview!',
		tooltip: 'Brief description of what this widget does',
		rows: 4,
	},
	{
		key: 'category',
		label: 'Category',
		type: 'select',
		required: true,
		tooltip: 'Organisational category for this widget',
		options: [
			{ label: 'Custom',    value: 'custom' },
			{ label: 'Standard',  value: 'standard' },
			{ label: 'Layout',    value: 'layout' },
			{ label: 'Data',      value: 'data' },
		],
		defaultValue: 'custom',
	},
	{
		key: 'version',
		label: 'Version',
		type: 'text',
		required: false,
		placeholder: '1.0.0',
		tooltip: 'Semantic version of this widget',
	},
	{
		key: 'minWidth',
		label: 'Min Width (px)',
		type: 'number',
		required: false,
		placeholder: '200',
		min: 0,
		max: 9999,
		tooltip: 'Minimum rendered width in pixels',
	},
	{
		key: 'previewUrl',
		label: 'Preview URL',
		type: 'url',
		required: false,
		placeholder: 'https://example.com/preview',
		tooltip: 'External URL for widget preview',
	},
	{
		key: 'accentColor',
		label: 'Accent Color',
		type: 'color',
		required: false,
		defaultValue: '#4c6ceb',
		tooltip: 'Primary accent color used in the widget',
	},
	{
		key: 'releaseDate',
		label: 'Release Date',
		type: 'date',
		required: false,
		tooltip: 'Planned or actual release date',
	},
	{
		key: 'access',
		label: 'Access Level',
		type: 'radio',
		required: false,
		options: [
			{ label: 'Public',   value: 'public' },
			{ label: 'Private',  value: 'private' },
			{ label: 'Internal', value: 'internal' },
		],
		defaultValue: 'public',
		tooltip: 'Who can view and use this widget',
	},
	{
		key: 'tags',
		label: 'Tags',
		type: 'multiselect',
		required: false,
		options: [
			{ label: 'Featured',    value: 'featured' },
			{ label: 'Beta',        value: 'beta' },
			{ label: 'Deprecated',  value: 'deprecated' },
			{ label: 'Experimental',value: 'experimental' },
		],
		defaultValue: [],
		tooltip: 'Labels applied to this widget',
	},
	{
		key: 'servicenow',
		label: 'ServiceNow native',
		type: 'toggle',
		required: false,
		defaultValue: false,
		tooltip: 'Whether this widget uses ServiceNow-specific APIs',
	},
	{
		key: 'chatCompatible',
		label: 'Chat compatible',
		type: 'checkbox',
		required: false,
		defaultValue: false,
		tooltip: 'Can this widget be rendered inline in chat',
	},
];

// ─────────────────────────────────────────────────────────────────────────────

class AiuxBuilderPropertyPanel extends AIUXWidgetElement {
	static properties = {
		/** Panel heading */
		panelTitle: { type: String, attribute: 'panel-title' },
		/** Icon name for the panel header (e.g. 'gear-outline') */
		panelIcon: { type: String, attribute: 'panel-icon' },
		/**
		 * Array of field descriptors. Each field: {
		 *   key, label, type, required?, placeholder?, tooltip?,
		 *   helpText?, options?[{label,value}], defaultValue?,
		 *   rows?, min?, max?, pattern?
		 * }
		 * Supported types: text | textarea | select | checkbox | toggle |
		 *   radio | multiselect | number | email | url | password | color | date
		 */
		schema:     { type: Array },
		/** Controlled form values object — keyed by field.key */
		values:     { type: Object },
		/** Show a close (×) button in the header */
		closable:   { type: Boolean },
		/** Show a loading skeleton instead of form fields */
		loading:    { type: Boolean },
		/** Hide the header entirely */
		hideHeader: { type: Boolean, attribute: 'hide-header' },

		/** When true all form inputs are disabled (protected / read-only record) */
		readOnly:      { type: Boolean, attribute: 'read-only' },

		// ── Mode switching ────────────────────────────
		/** Panel mode: 'form' (default) | 'script-runner' */
		mode:          { type: String },

		// ── Footer configuration ──────────────────────
		/** Footer action type: 'save' | 'apply' | 'run' | custom string. Empty = no footer */
		footerAction:  { type: String, attribute: 'footer-action' },
		/** Button text (auto-defaults based on footerAction) */
		footerLabel:   { type: String, attribute: 'footer-label' },
		/** Button color (green for run, blue otherwise). Accepts any CSS color */
		footerColor:   { type: String, attribute: 'footer-color' },
		/** Disable footer button */
		footerDisabled:{ type: Boolean, attribute: 'footer-disabled' },

		// ── Script runner mode props ──────────────────
		/** Options JSON string for script runner */
		optionsJson:   { type: String, attribute: 'options-json' },
		/** Input JSON string for script runner */
		inputJson:     { type: String, attribute: 'input-json' },
		/** Read-only output text */
		output:        { type: String },
		/** Output status: '' | 'success' | 'error' */
		outputStatus:  { type: String, attribute: 'output-status' },
		/** Script running state */
		running:       { type: Boolean },

		// ── internal ──────────────────────────────────
		_vals:      { type: Object,  state: true },
		_errors:    { type: Object,  state: true },
		_touched:   { type: Object,  state: true },
		_submitted: { type: Boolean, state: true },
		/** Active script runner tab: 'input' | 'output' */
		_scriptTab: { type: String,  state: true },
		_pillSearch: { type: Object, state: true },
		_pillOpen: { type: Object, state: true },
		_pillHighlight: { type: Object, state: true },
	};

	constructor() {
		super();
		this.panelTitle     = i18n.getMessage('Widget properties');
		this.panelIcon      = '';
		this.schema         = [];
		this.values         = {};
		this.closable       = true;
		this.loading        = false;
		this.hideHeader     = false;
		this.readOnly       = false;
		this.mode           = 'form';
		this.footerAction   = '';
		this.footerLabel    = '';
		this.footerColor    = '';
		this.footerDisabled = false;
		this.optionsJson    = '{}';
		this.inputJson      = '{}';
		this.output         = '';
		this.outputStatus   = '';
		this.running        = false;
		this._vals          = {};
		this._errors        = {};
		this._touched       = {};
		this._submitted     = false;
		this._scriptTab     = 'input';
		this._pillSearch    = {};
		this._pillOpen      = {};
		this._pillHighlight = {};
		this._copyLabel = '';
	}

	// Initialise _vals from schema defaults + passed values
	connectedCallback() {
		super.connectedCallback();
		this._initValues();
	}

	willUpdate(changed) {
		if (changed.has('schema') || changed.has('values')) {
			this._initValues();
		}
		// Auto-switch to output tab when script starts running
		if (changed.has('running') && this.running) {
			this._scriptTab = 'output';
		}
	}

	_initValues() {
		const init = {};
		(this.schema || []).forEach(f => {
			if (f.key in (this.values || {})) {
				init[f.key] = this.values[f.key];
			} else if (f.defaultValue !== undefined) {
				init[f.key] = f.defaultValue;
			} else if (f.type === 'checkbox' || f.type === 'toggle') {
				init[f.key] = false;
			} else if (f.type === 'multiselect' || f.type === 'pillselect') {
				init[f.key] = [];
			} else {
				init[f.key] = '';
			}
		});
		this._vals = init;
	}

	// ── Value helpers ─────────────────────────────────────────────────────

	_get(key) {
		return this._vals[key] ?? '';
	}

	_set(key, value) {
		const field = (this.schema || []).find(f => f.key === key);
		if (field?.disabled || this.readOnly) return;
		this._vals    = { ...this._vals,   [key]: value };
		this._touched = { ...this._touched,[key]: true  };
		this._errors  = { ...this._errors, [key]: this._validateField(key, value) };
		this._dispatchPanelEvent('change', { key, value, values: this._vals });
	}

	_toggleMulti(key, value) {
		const current = Array.isArray(this._vals[key]) ? [...this._vals[key]] : [];
		const idx = current.indexOf(value);
		idx === -1 ? current.push(value) : current.splice(idx, 1);
		this._set(key, current);
	}

	// ── Validation ────────────────────────────────────────────────────────

	_validateField(key, value) {
		const field = (this.schema || []).find(f => f.key === key);
		if (!field) return '';
		const v = Array.isArray(value) ? value : String(value ?? '').trim();
		if (field.required && (Array.isArray(v) ? v.length === 0 : v === '')) {
			return `${field.label} ${i18n.getMessage('is required')}`;
		}
		if (field.type === 'url' && v && !/^https?:\/\/.+/.test(v)) {
			return i18n.getMessage('Enter a valid URL starting with http:// or https://');
		}
		if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
			return i18n.getMessage('Enter a valid email address');
		}
		if (field.type === 'number') {
			if (field.min !== undefined && Number(v) < field.min) return `${i18n.getMessage('Minimum value is')} ${field.min}`;
			if (field.max !== undefined && Number(v) > field.max) return `${i18n.getMessage('Maximum value is')} ${field.max}`;
		}
		if (field.pattern && v && !new RegExp(field.pattern).test(v)) {
			return field.patternError || i18n.getMessage('Invalid format');
		}
		return '';
	}

	_validateAll() {
		const errors = {};
		let valid = true;
		(this.schema || []).forEach(f => {
			const e = this._validateField(f.key, this._vals[f.key]);
			errors[f.key] = e;
			if (e) valid = false;
		});
		this._errors    = errors;
		this._submitted = true;
		return valid;
	}

	// ── Dispatch ──────────────────────────────────────────────────────────

	_dispatchPanelEvent(name, detail = {}) {
		this.dispatchEvent(new CustomEvent(`wb-property-${name}`, {
			detail,
			bubbles: true,
			composed: true,
		}));
	}

	_handleClose() {
		this._dispatchPanelEvent('close');
	}

	_handleSave() {
		if (this._validateAll()) {
			this._dispatchPanelEvent('save', { values: { ...this._vals } });
		}
	}

	_handleReset() {
		this._initValues();
		this._errors    = {};
		this._touched   = {};
		this._submitted = false;
		this._dispatchPanelEvent('reset');
	}

	// ── Icons ─────────────────────────────────────────────────────────────

	_iconClose() {
		return html`<aiux-icon name="close-outline" size="sm"></aiux-icon>`;
	}

	_iconInfo() {
		return html`<aiux-icon name="circle-info-outline" size="xs" class="icon-secondary"></aiux-icon>`;
	}

	_iconChevron() {
		return html`<aiux-icon name="chevron-down-outline" size="sm" class="icon-secondary"></aiux-icon>`;
	}

	_iconError() {
		return html`<aiux-icon name="circle-exclamation-outline" size="xs" class="icon-error"></aiux-icon>`;
	}

	// ── Field label row ───────────────────────────────────────────────────

	_getTooltipPosition(field) {
		const shortLabelFields = ['roles'];
		return shortLabelFields.includes(field.key) ? 'aiux-tooltip-right' : 'aiux-tooltip-top';
	}

	_renderLabel(field) {
		return html`
			<div class="field-label-row">
				${field.required
					? html`<span class="required-star" aria-hidden="true">*</span>`
					: nothing}
				<span class="field-label">${field.label}</span>
				${field.tooltip ? html`
					<div class="aiux-tooltip ${this._getTooltipPosition(field)}">
						<div class="aiux-tooltip-content">
							${field.tooltip}
						</div>
						<button
							class="aiux-btn aiux-btn-ghost aiux-btn-circle aiux-btn-xs"
							aria-label="${field.label} info"
						>
							<aiux-icon name="circle-info-outline" size="xs"></aiux-icon>
						</button>
					</div>
				` : nothing}
			</div>
		`;
	}

	_renderError(key) {
		const show = this._errors[key] && (this._touched[key] || this._submitted);
		return show ? html`
			<div class="error-row">
				${this._iconError()}
				<span>${this._errors[key]}</span>
			</div>
		` : nothing;
	}

	_renderHelpText(field) {
		return field.helpText ? html`<p class="help-text">${field.helpText}</p>` : nothing;
	}

	// ── Input renderers ───────────────────────────────────────────────────

	_renderText(field) {
		const err  = this._errors[field.key] && (this._touched[field.key] || this._submitted);
		return html`
			<input
				type="${field.type === 'password' ? 'password' : field.type === 'email' ? 'email' : 'text'}"
				class="aiux-input aiux-input-md ${err ? 'input-error' : ''}"
				.value=${this._get(field.key)}
				placeholder="${field.placeholder || ''}"
				?required=${field.required}
				?disabled=${field.disabled || this.readOnly}
				autocomplete="${field.type === 'password' ? 'current-password' : 'off'}"
				aria-label="${field.label}"
				aria-invalid="${err ? 'true' : 'false'}"
				@input=${(e) => this._set(field.key, e.target.value)}
				@blur=${() => {
					this._touched = { ...this._touched, [field.key]: true };
					this._errors  = { ...this._errors,  [field.key]: this._validateField(field.key, this._vals[field.key]) };
					this.requestUpdate();
				}}
			/>
		`;
	}

	_renderNumber(field) {
		const err = this._errors[field.key] && (this._touched[field.key] || this._submitted);
		return html`
			<input
				type="number"
				class="aiux-input aiux-input-md ${err ? 'input-error' : ''}"
				.value=${this._get(field.key)}
				placeholder="${field.placeholder || ''}"
				min="${field.min ?? ''}"
				max="${field.max ?? ''}"
				?required=${field.required}
				?disabled=${this.readOnly}
				aria-label="${field.label}"
				aria-invalid="${err ? 'true' : 'false'}"
				@input=${(e) => this._set(field.key, e.target.value)}
				@blur=${() => {
					this._touched = { ...this._touched, [field.key]: true };
					this._errors  = { ...this._errors,  [field.key]: this._validateField(field.key, this._vals[field.key]) };
					this.requestUpdate();
				}}
			/>
		`;
	}

	_renderUrl(field) {
		const err = this._errors[field.key] && (this._touched[field.key] || this._submitted);
		return html`
			<input
				type="url"
				class="aiux-input aiux-input-md ${err ? 'input-error' : ''}"
				.value=${this._get(field.key)}
				placeholder="${field.placeholder || 'https://'}"
				?required=${field.required}
				?disabled=${this.readOnly}
				aria-label="${field.label}"
				aria-invalid="${err ? 'true' : 'false'}"
				@input=${(e) => this._set(field.key, e.target.value)}
				@blur=${() => {
					this._touched = { ...this._touched, [field.key]: true };
					this._errors  = { ...this._errors,  [field.key]: this._validateField(field.key, this._vals[field.key]) };
					this.requestUpdate();
				}}
			/>
		`;
	}

	_renderTextarea(field) {
		const err = this._errors[field.key] && (this._touched[field.key] || this._submitted);
		return html`
			<textarea
				class="aiux-textarea aiux-textarea-md ${err ? 'textarea-error' : ''}"
				.value=${this._get(field.key)}
				placeholder="${field.placeholder || ''}"
				rows="${field.rows || 4}"
				?required=${field.required}
				?disabled=${field.disabled || this.readOnly}
				aria-label="${field.label}"
				aria-invalid="${err ? 'true' : 'false'}"
				@input=${(e) => this._set(field.key, e.target.value)}
				@blur=${() => {
					this._touched = { ...this._touched, [field.key]: true };
					this._errors  = { ...this._errors,  [field.key]: this._validateField(field.key, this._vals[field.key]) };
					this.requestUpdate();
				}}
			></textarea>
		`;
	}

	_renderSelect(field) {
		const err = this._errors[field.key] && (this._touched[field.key] || this._submitted);
		return html`
			<select
					class="aiux-select aiux-select-md ${err ? 'select-error' : ''}"
					.value=${this._get(field.key)}
					?required=${field.required}
					?disabled=${field.disabled || this.readOnly}
					aria-label="${field.label}"
					aria-invalid="${err ? 'true' : 'false'}"
					@change=${(e) => this._set(field.key, e.target.value)}
					@blur=${() => {
						this._touched = { ...this._touched, [field.key]: true };
						this.requestUpdate();
					}}
				>
					${!field.required ? html`<option value="">${i18n.getMessage('— Select —')}</option>` : nothing}
					${(field.options || []).map(opt => html`
						<option value="${opt.value}" ?selected=${this._get(field.key) === opt.value}>
							${opt.label}
						</option>
					`)}
				</select>
		`;
	}

	_renderCheckbox(field) {
		const checked = !!this._get(field.key);
		return html`
			<label class="checkbox-row">
				<input
					type="checkbox"
					class="aiux-checkbox aiux-checkbox-md aiux-checkbox-accent"
					.checked=${checked}
					?disabled=${this.readOnly}
					aria-label="${field.label}"
					@change=${(e) => this._set(field.key, e.target.checked)}
				/>
				<span class="checkbox-label">${field.label}</span>
				${field.tooltip ? html`
					<div class="aiux-tooltip ${this._getTooltipPosition(field)}">
						<div class="aiux-tooltip-content">
							${field.tooltip}
						</div>
						<button
							class="aiux-btn aiux-btn-ghost aiux-btn-circle aiux-btn-xs"
							aria-label="${field.label} info"
						>
							<aiux-icon name="circle-info-outline" size="xs"></aiux-icon>
						</button>
					</div>
				` : nothing}
			</label>
		`;
	}

	_renderToggle(field) {
		const on = !!this._get(field.key);
		return html`
			<label class="toggle-row">
				<input
					type="checkbox"
					class="aiux-toggle aiux-toggle-md aiux-toggle-accent"
					.checked=${on}
					?disabled=${this.readOnly}
					role="switch"
					aria-checked="${on}"
					aria-label="${field.label}"
					@change=${(e) => this._set(field.key, e.target.checked)}
				/>
				<span class="toggle-label">${field.label}</span>
				${field.tooltip ? html`
					<div class="aiux-tooltip ${this._getTooltipPosition(field)}">
						<div class="aiux-tooltip-content">
							${field.tooltip}
						</div>
						<button
							class="aiux-btn aiux-btn-ghost aiux-btn-circle aiux-btn-xs"
							aria-label="${field.label} info"
						>
							<aiux-icon name="circle-info-outline" size="xs"></aiux-icon>
						</button>
					</div>
				` : nothing}
			</label>
		`;
	}

	_renderRadio(field) {
		const current = this._get(field.key);
		return html`
			<div class="radio-group" role="radiogroup" aria-label="${field.label}">
				${(field.options || []).map(opt => html`
					<label class="radio-row">
						<input
							type="radio"
							class="aiux-radio aiux-radio-md aiux-radio-accent"
							name="${field.key}"
							value="${opt.value}"
							.checked=${current === opt.value}
							?disabled=${this.readOnly}
							@change=${() => this._set(field.key, opt.value)}
						/>
						<span class="radio-label">${opt.label}</span>
					</label>
				`)}
			</div>
		`;
	}

	_renderMultiselect(field) {
		const current = Array.isArray(this._vals[field.key]) ? this._vals[field.key] : [];
		return html`
			<div class="multi-group">
				${(field.options || []).map(opt => {
					const checked = current.includes(opt.value);
					return html`
						<label class="multi-row">
							<input
								type="checkbox"
								class="aiux-checkbox aiux-checkbox-md aiux-checkbox-accent"
								.checked=${checked}
								?disabled=${this.readOnly}
								aria-label="${opt.label}"
								@change=${() => this._toggleMulti(field.key, opt.value)}
							/>
							<span class="multi-option-label">${opt.label}</span>
						</label>
					`;
				})}
				${current.length > 0 ? html`
					<div class="multi-tags">
						${current.map(v => {
							const opt = (field.options || []).find(o => o.value === v);
							return html`
								<span class="multi-tag">
									${opt ? opt.label : v}
									<button
										class="multi-tag-remove"
										?disabled=${this.readOnly}
										@click=${() => this._toggleMulti(field.key, v)}
										aria-label="Remove ${opt ? opt.label : v}"
									>×</button>
								</span>
							`;
						})}
					</div>
				` : nothing}
			</div>
		`;
	}

	_renderPillSelect(field) {
		const selected = Array.isArray(this._vals[field.key]) ? this._vals[field.key] : [];
		const options = field.options || [];
		const search = this._pillSearch[field.key] || '';
		const isOpen = !!this._pillOpen[field.key];
		const highlightIdx = this._pillHighlight?.[field.key] ?? -1;

		// O(1) label lookup
		const labelMap = new Map(options.map(o => [o.value, o.label]));
		const selectedSet = new Set(selected);
		const lowerSearch = search.toLowerCase();
		const filtered = options.filter(o =>
			!selectedSet.has(o.value) && (!search || o.label.toLowerCase().includes(lowerSearch))
		);
		const visible = filtered.slice(0, 50);

		const _selectItem = (opt) => {
			this._set(field.key, [...selected, opt.value]);
			this._pillSearch = { ...this._pillSearch, [field.key]: '' };
			this._pillHighlight = { ...this._pillHighlight, [field.key]: -1 };
		};

		const _handleKeydown = (e) => {
			if (!isOpen || visible.length === 0) {
				if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
					this._pillOpen = { ...this._pillOpen, [field.key]: true };
				}
				return;
			}
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault();
					this._pillHighlight = { ...this._pillHighlight, [field.key]: Math.min(highlightIdx + 1, visible.length - 1) };
					break;
				case 'ArrowUp':
					e.preventDefault();
					this._pillHighlight = { ...this._pillHighlight, [field.key]: Math.max(highlightIdx - 1, 0) };
					break;
				case 'Enter':
					e.preventDefault();
					if (highlightIdx >= 0 && highlightIdx < visible.length) {
						_selectItem(visible[highlightIdx]);
					}
					break;
				case 'Escape':
					this._pillOpen = { ...this._pillOpen, [field.key]: false };
					this._pillHighlight = { ...this._pillHighlight, [field.key]: -1 };
					break;
			}
		};

		return html`
			<div class="pill-select">
				<!-- Search input -->
				<div class="pill-search-wrap">
					<input
						type="text"
						class="aiux-input aiux-input-md"
						placeholder="${field.placeholder || i18n.getMessage('Search...')}"
						.value=${search}
						aria-label="${field.label} ${i18n.getMessage('search')}"
						autocomplete="off"
						?disabled=${this.readOnly}
						@input=${(e) => {
							this._pillSearch = { ...this._pillSearch, [field.key]: e.target.value };
							this._pillOpen = { ...this._pillOpen, [field.key]: true };
							this._pillHighlight = { ...this._pillHighlight, [field.key]: -1 };
						}}
						@focus=${() => { this._pillOpen = { ...this._pillOpen, [field.key]: true }; }}
						@blur=${() => { setTimeout(() => {
							this._pillOpen = { ...this._pillOpen, [field.key]: false };
							this._pillHighlight = { ...this._pillHighlight, [field.key]: -1 };
						}, 200); }}
						@keydown=${_handleKeydown}
					/>
				</div>
				<!-- Selected pills -->
				${selected.length > 0 ? html`
					<div class="pill-tags">
						${selected.map(v => {
							const label = labelMap.get(v) || v;
							return html`
								<span class="aiux-badge aiux-badge-primary aiux-badge-md pill-tag">
									<span class="pill-tag-label">${label}</span>
									<button
										class="pill-remove"
										?disabled=${this.readOnly}
										@click=${() => {
											const next = selected.filter(s => s !== v);
											this._set(field.key, next);
										}}
										aria-label="Remove ${label}"
									>\u00d7</button>
								</span>
							`;
						})}
					</div>
				` : nothing}
				<!-- Dropdown -->
				${isOpen ? html`
					${visible.length > 0 ? html`
						<ul class="pill-dropdown" role="listbox">
							${visible.map((opt, i) => html`
								<li
									class="pill-dropdown-item ${i === highlightIdx ? 'pill-dropdown-item--active' : ''}"
									role="option"
									aria-selected="${i === highlightIdx}"
									@mousedown=${(e) => { e.preventDefault(); _selectItem(opt); }}
									@mouseenter=${() => { this._pillHighlight = { ...this._pillHighlight, [field.key]: i }; }}
								>${opt.label}</li>
							`)}
						</ul>
					` : html`
						<div class="pill-dropdown pill-dropdown-empty">${i18n.getMessage('No results found')}</div>
					`}
				` : nothing}
			</div>
		`;
	}

	_renderColor(field) {
		const val = this._get(field.key) || '#000000';
		return html`
			<div class="color-row">
				<input
					type="color"
					class="color-swatch"
					.value=${val}
					?disabled=${this.readOnly}
					aria-label="${field.label}"
					@input=${(e) => this._set(field.key, e.target.value)}
				/>
				<input
					type="text"
					class="aiux-input aiux-input-md color-text"
					.value=${val}
					placeholder="#000000"
					maxlength="7"
					?disabled=${this.readOnly}
					aria-label="${field.label} hex value"
					@input=${(e) => {
						const v = e.target.value;
						if (/^#[0-9a-fA-F]{6}$/.test(v)) this._set(field.key, v);
					}}
				/>
			</div>
		`;
	}

	_renderDate(field) {
		const err = this._errors[field.key] && (this._touched[field.key] || this._submitted);
		return html`
			<input
				type="date"
				class="aiux-input aiux-input-md ${err ? 'input-error' : ''}"
				.value=${this._get(field.key)}
				?required=${field.required}
				?disabled=${this.readOnly}
				aria-label="${field.label}"
				aria-invalid="${err ? 'true' : 'false'}"
				@change=${(e) => this._set(field.key, e.target.value)}
			/>
		`;
	}

	// ── Field dispatcher ──────────────────────────────────────────────────

	_renderFieldInput(field) {
		switch (field.type) {
			case 'text':
			case 'email':
			case 'password': return this._renderText(field);
			case 'number':   return this._renderNumber(field);
			case 'url':      return this._renderUrl(field);
			case 'textarea': return this._renderTextarea(field);
			case 'select':   return this._renderSelect(field);
			case 'checkbox': return this._renderCheckbox(field);
			case 'toggle':   return this._renderToggle(field);
			case 'radio':    return this._renderRadio(field);
			case 'multiselect': return this._renderMultiselect(field);
			case 'pillselect':  return this._renderPillSelect(field);
			case 'color':    return this._renderColor(field);
			case 'date':     return this._renderDate(field);
			default:         return html`<p class="error-message">Unknown field type: ${field.type}</p>`;
		}
	}

	// Fields that always span the full grid width regardless of column count
	_isFullWidth(field) {
		return ['textarea', 'radio', 'multiselect', 'pillselect', 'checkbox', 'toggle', 'color'].includes(field.type);
	}

	_renderField(field) {
		const full    = this._isFullWidth(field);
		const isInline = field.type === 'checkbox' || field.type === 'toggle';
		const cls     = `field-wrap${full ? ' field-wrap--full' : ''}`;

		if (isInline) {
			return html`<div class="${cls}">${this._renderFieldInput(field)}</div>`;
		}
		return html`
			<div class="${cls}">
				${this._renderLabel(field)}
				${this._renderFieldInput(field)}
				${this._renderError(field.key)}
				${this._renderHelpText(field)}
			</div>
		`;
	}

	// ── Panel sections ────────────────────────────────────────────────────

	_renderHeader() {
		if (this.hideHeader) return nothing;
		return html`
			<header class="panel-header">
				<div class="panel-title-row">
					${this.panelIcon ? html`<aiux-icon name="${this.panelIcon}" size="md" class="panel-title-icon"></aiux-icon>` : nothing}
					<h2 class="panel-title">${this.panelTitle}</h2>
				</div>
				${this.closable ? html`
					<button
						class="close-btn"
						@click=${this._handleClose}
						aria-label="Close ${this.panelTitle}"
					>${this._iconClose()}</button>
				` : nothing}
			</header>
		`;
	}

	_renderForm() {
		const fields = this.schema || [];
		if (fields.length === 0) {
			return html`
				<div class="panel-empty">
					${this._iconInfo()}
					<p class="panel-empty-title">${i18n.getMessage('No properties defined')}</p>
					<p class="panel-empty-desc">${i18n.getMessage('Add an input_schema to configure properties')}</p>
				</div>
			`;
		}
		return html`
			<div class="panel-form" role="form" aria-label="${this.panelTitle} form">
				${fields.map(field => this._renderField(field))}
			</div>
		`;
	}

	// ── Footer ────────────────────────────────────────────────────────────

	_handleFooterAction() {
		const isOutputCopy = this._isOutputCopyMode;
		if (isOutputCopy) {
			this._handleCopyOutput();
			return;
		}
		this._dispatchPanelEvent('action', { action: this.footerAction });
	}

	get _isOutputCopyMode() {
		return this.mode === 'script-runner'
			&& this._scriptTab === 'output'
			&& this.output
			&& !this.running;
	}

	async _handleCopyOutput() {
		try {
			await navigator.clipboard.writeText(this.output);
			this._copyLabel = i18n.getMessage('Copied!');
			this.requestUpdate();
			setTimeout(() => { this._copyLabel = ''; this.requestUpdate(); }, 1500);
		} catch {
			// Fallback for environments without clipboard API
			const ta = document.createElement('textarea');
			ta.value = this.output;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
			this._copyLabel = i18n.getMessage('Copied!');
			this.requestUpdate();
			setTimeout(() => { this._copyLabel = ''; this.requestUpdate(); }, 1500);
		}
	}

	_iconPlay() {
		return html`<aiux-icon name="play-outline" size="sm" class="icon-on-filled"></aiux-icon>`;
	}

	_iconCopy() {
		return html`<aiux-icon name="copy-outline" size="sm" class="icon-on-filled"></aiux-icon>`;
	}

	_renderFooter() {
		if (!this.footerAction) return nothing;

		const isOutputCopy = this._isOutputCopyMode;

		const label = isOutputCopy
			? (this._copyLabel || i18n.getMessage('Copy'))
			: (this.footerLabel
				|| (this.footerAction === 'run' ? (this.running ? i18n.getMessage('Running…') : i18n.getMessage('Run'))
					: this.footerAction === 'apply' ? i18n.getMessage('Apply')
					: this.footerAction === 'save' ? i18n.getMessage('Save')
					: this.footerAction));

		const color = isOutputCopy
			? 'var(--color-primary, #4c6ceb)'
			: (this.footerColor
				|| (this.footerAction === 'run' ? 'var(--color-success, #298317)' : 'var(--color-primary, #4c6ceb)'));

		const disabled = isOutputCopy ? false : (this.footerDisabled || this.running || this.readOnly);

		const icon = isOutputCopy ? this._iconCopy() : (this.footerAction === 'run' ? this._iconPlay() : nothing);

		return html`
			<div class="panel-footer">
				<button
					class="footer-action-btn"
					style="background:${color};"
					@click=${this._handleFooterAction}
					?disabled=${disabled}
					aria-label="${label}"
				>
					${icon}
					<span>${label}</span>
				</button>
			</div>
		`;
	}

	// ── Script Runner ─────────────────────────────────────────────────────

	_renderScriptRunner() {
		return html`
			<!-- Tab bar: Input | Output -->
			<div class="script-tabs">
				<div role="tablist" class="aiux-tabs aiux-tabs-box aiux-tabs-sm">
					${['input', 'output'].map(tab => {
						const active = this._scriptTab === tab;
						const tabLabel = tab === 'input' ? i18n.getMessage('Input') : i18n.getMessage('Output');
						return html`
							<button
								class="aiux-tab ${active ? 'aiux-tab-active' : ''}"
								@click=${() => { this._scriptTab = tab; }}
								role="tab"
								aria-selected=${active}
								aria-label="${tabLabel} ${i18n.getMessage('panel')}"
							>${tabLabel}</button>
						`;
					})}
				</div>
			</div>

			<!-- Tab content -->
			${this._scriptTab === 'input'
				? this._renderScriptInput()
				: this._renderScriptOutput()
			}
		`;
	}

	_renderScriptInput() {
		return html`
			<div class="script-input-area">
				<!-- Options JSON -->
				<fieldset class="script-fieldset">
					<div class="script-fieldset-header">
						<legend class="script-fieldset-legend">${i18n.getMessage('Options (json)')}</legend>
					</div>
					<textarea
						class="script-textarea"
						placeholder="{}"
						.value=${this.optionsJson}
						@input=${(e) => this._dispatchPanelEvent('input-change', { field: 'options', value: e.target.value })}
						aria-label="${i18n.getMessage('Options JSON')}"
						spellcheck="false"
						?disabled=${this.readOnly}
					></textarea>
					<p class="script-hint">${i18n.getMessage('Accessed as options.key in script')}</p>
				</fieldset>

				<!-- Input JSON -->
				<fieldset class="script-fieldset">
					<div class="script-fieldset-header">
						<legend class="script-fieldset-legend">${i18n.getMessage('Input (json)')}</legend>
					</div>
					<textarea
						class="script-textarea"
						placeholder="{}"
						.value=${this.inputJson}
						@input=${(e) => this._dispatchPanelEvent('input-change', { field: 'input', value: e.target.value })}
						aria-label="${i18n.getMessage('Input JSON')}"
						spellcheck="false"
						?disabled=${this.readOnly}
					></textarea>
					<p class="script-hint">${i18n.getMessage('Accessed as input.key in script')}</p>
				</fieldset>
			</div>
		`;
	}

	_renderScriptOutput() {
		if (this.running) {
			return html`
				<div class="script-output-empty">
					<div class="script-spinner"></div>
					<p class="script-status-text">${i18n.getMessage('Running script…')}</p>
				</div>
			`;
		}
		if (!this.output) {
			return html`
				<div class="script-output-empty">
					<aiux-icon name="document-code-outline" size="lg" class="icon-muted"></aiux-icon>
					<p class="script-status-text script-status-text--label">${i18n.getMessage('No output yet')}</p>
					<p class="script-status-text script-status-text--hint">${i18n.getMessage('Run the script to see results')}</p>
				</div>
			`;
		}
		const isError = this.outputStatus === 'error';
		return html`
			<div class="script-output-area">
				<pre class="script-output-pre ${isError ? 'script-output-pre--error' : ''}">${this.output}</pre>
			</div>
		`;
	}

	// ── Root ──────────────────────────────────────────────────────────────

	_renderLoadingSkeleton() {
		return html`
			<div class="loading-skeleton">
				${[1, 2, 3, 4, 5].map(() => html`
					<div class="skeleton-field">
						<div class="skeleton-label"></div>
						<div class="skeleton-input"></div>
					</div>
				`)}
			</div>
		`;
	}

	render() {
		return html`
			<div class="panel-root">
				${this._renderHeader()}
				<div class="panel-body">
					${this.loading
						? this._renderLoadingSkeleton()
						: this.mode === 'script-runner'
							? this._renderScriptRunner()
							: this._renderForm()
					}
				</div>
				${this.loading ? nothing : this._renderFooter()}
			</div>
		`;
	}

	// ── Styles ────────────────────────────────────────────────────────────

	static styles = css`
		/* ── Host ─────────────────────────────────────────────────────────── */
		:host {
			display: block;
			width: 100%;
			height: 100%;
			font-family: var(--font-sans, Inter);
			container-type: inline-size;
			container-name: panel;
		}

		/* ── Shell ─────────────────────────────────────────────────────────── */
		.panel-root {
			display: flex;
			flex-direction: column;
			width: 100%;
			min-width: 280px;
			height: 100%;
			background: var(--color-base-100, #ffffff);
			border-radius: var(--radius-2xl, 1rem);
			overflow: scroll;
		}

		/* ── Header ────────────────────────────────────────────────────────── */
		.panel-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			height: calc(var(--spacing, 0.25rem) * 16);
			padding: 0 calc(var(--spacing, 0.25rem) * 3) 0 calc(var(--spacing, 0.25rem) * 4);
			border-bottom: 1px solid var(--color-border-subtle, #f0f0f0);
			flex-shrink: 0;
			box-sizing: border-box;
		}
		.panel-title-row {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			min-width: 0;
		}
		.panel-title-icon {
			color: var(--color-base-content-secondary, #6b7280);
			flex-shrink: 0;
		}
		.panel-title {
			font-family: var(--font-servicenow, 'ServiceNow Sans', sans-serif);
			font-size: var(--text-base, 1rem);
			font-weight: var(--font-weight-normal, 400);
			line-height: var(--leading-6, 1.5rem);
			color: var(--color-base-content, #000000);
			margin: 0;
		}
		.close-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: calc(var(--spacing, 0.25rem) * 8);
			height: calc(var(--spacing, 0.25rem) * 8);
			min-width: calc(var(--spacing, 0.25rem) * 8);
			border-radius: var(--radius-lg, 0.5rem);
			background: transparent;
			border: none;
			cursor: pointer;
			transition: background 0.15s var(--ease-out, ease);
		}
		.close-btn:hover { background: var(--color-base-200, #f3f3f3); }

		/* ── Body / scrollable ─────────────────────────────────────────────── */
		.panel-body {
			flex: 1;
			overflow: visible;
			padding: 0 calc(var(--spacing, 0.25rem) * 4);
		}
		.panel-body::-webkit-scrollbar { width: calc(var(--spacing, 0.25rem) * 1); }
		.panel-body::-webkit-scrollbar-track { background: transparent; }
		.panel-body::-webkit-scrollbar-thumb { background: var(--color-border-subtle, #e0e0e0); border-radius: var(--radius-sm, 0.25rem); }

		/* ── Form grid ─────────────────────────────────────────────────────── */
		/*
		 * Narrow  (< 480px)  → 1 column
		 * Medium  (480–799px)→ 2 columns for short fields, full-width for complex
		 * Wide    (≥ 800px)  → 2 columns + more padding
		 */
		.panel-form {
			display: grid;
			grid-template-columns: 1fr;
			gap: 0;
			padding-bottom: calc(var(--spacing, 0.25rem) * 2);
		}
		@container panel (min-width: 480px) {
			.panel-form {
				grid-template-columns: repeat(2, 1fr);
				column-gap: calc(var(--spacing, 0.25rem) * 4);
			}
		}

		/* ── Field wrap ─────────────────────────────────────────────────────── */
		.field-wrap {
			padding: calc(var(--spacing, 0.25rem) * 2.5) 0;
			border-bottom: 1px solid var(--color-base-200, #f3f3f3);
			min-width: 0; /* prevent overflow in grid cells */
		}
		.field-wrap:last-child { border-bottom: none; }

		/* Complex / tall fields always span the full row */
		.field-wrap--full {
			grid-column: 1 / -1;
		}

		/* ── Label row ─────────────────────────────────────────────────────── */
		.field-label-row {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1);
			margin-bottom: calc(var(--spacing, 0.25rem) * 1.5);
		}
		.required-star {
			color: var(--color-error, #be0003);
			font-size: var(--text-sm, 0.875rem);
			line-height: 1;
			font-weight: var(--font-weight-semibold, 600);
		}
		.field-label {
			font-size: var(--text-xs, 0.75rem);
			font-weight: var(--font-weight-medium, 500);
			color: var(--color-base-content, #000000);
		}
		/* ── Text / number / email / url / password / date ─────────────────── */
		.field-input {
			width: 100%;
			height: calc(var(--spacing, 0.25rem) * 8);
			padding: 0 calc(var(--spacing, 0.25rem) * 3);
			border: 1px solid var(--color-border-subtle, #e0e0e0);
			border-radius: var(--radius-lg, 0.5rem);
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content, #000000);
			background: var(--color-base-100, #ffffff);
			outline: none;
			box-sizing: border-box;
			transition: border-color 0.15s var(--ease-out, ease);
		}
		.field-input:focus {
			border-color: var(--color-primary, #4c6ceb);
			box-shadow: 0 0 0 2px rgba(76,108,235,0.12);
		}
		.field-input--error { border-color: var(--color-error, #be0003) !important; }
		.field-input[disabled],
		.field-textarea[disabled],
		.field-select[disabled] {
			opacity: 0.6;
			cursor: not-allowed;
			background: var(--color-base-200, #f3f4f6);
		}

		/* ── Textarea ──────────────────────────────────────────────────────── */
		.field-textarea {
			width: 100%;
			padding: calc(var(--spacing, 0.25rem) * 2.5) calc(var(--spacing, 0.25rem) * 3);
			border: 1px solid var(--color-border-subtle, #e0e0e0);
			border-radius: var(--radius-lg, 0.5rem);
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content, #000000);
			background: var(--color-base-100, #ffffff);
			outline: none;
			resize: vertical;
			box-sizing: border-box;
			font-family: inherit;
			line-height: 1.5;
			transition: border-color 0.15s var(--ease-out, ease);
		}
		.field-textarea:focus {
			border-color: var(--color-primary, #4c6ceb);
			box-shadow: 0 0 0 2px rgba(76,108,235,0.12);
		}

		/* ── Select ────────────────────────────────────────────────────────── */
		.select-wrapper {
			position: relative;
			border: 1px solid var(--color-border-subtle, #e0e0e0);
			border-radius: var(--radius-lg, 0.5rem);
			background: var(--color-base-100, #ffffff);
			overflow: hidden;
			transition: border-color 0.15s var(--ease-out, ease);
		}
		.select-wrapper:focus-within {
			border-color: var(--color-primary, #4c6ceb);
			box-shadow: 0 0 0 2px rgba(76,108,235,0.12);
		}
		.field-select {
			width: 100%;
			height: calc(var(--spacing, 0.25rem) * 8);
			padding: 0 calc(var(--spacing, 0.25rem) * 8) 0 calc(var(--spacing, 0.25rem) * 3);
			border: none;
			background: transparent;
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content, #000000);
			outline: none;
			appearance: none;
			cursor: pointer;
			box-sizing: border-box;
		}
		.select-chevron {
			position: absolute;
			right: calc(var(--spacing, 0.25rem) * 2);
			top: 50%;
			transform: translateY(-50%);
			pointer-events: none;
		}

		/* ── Checkbox ──────────────────────────────────────────────────────── */
		.checkbox-row {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2.5);
			cursor: pointer;
		}
		.custom-checkbox {
			display: flex;
			align-items: center;
			justify-content: center;
			width: calc(var(--spacing, 0.25rem) * 5);
			height: calc(var(--spacing, 0.25rem) * 5);
			min-width: calc(var(--spacing, 0.25rem) * 5);
			border-radius: var(--radius-sm, 0.25rem);
			border: 1.5px solid var(--color-border-default, #d0d0d0);
			background: var(--color-base-200, #f3f3f3);
			transition: background var(--duration-xs, 150ms) var(--ease-low-accel, ease), border-color var(--duration-xs, 150ms) var(--ease-low-accel, ease);
		}
		.custom-checkbox--checked {
			background: var(--color-primary, #4c6ceb);
			border-color: var(--color-primary, #4c6ceb);
		}
		.checkbox-label { font-size: var(--text-sm, 0.875rem); color: var(--color-base-content, #000000); }

		/* ── Toggle ────────────────────────────────────────────────────────── */
		.toggle-row {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2.5);
			cursor: pointer;
		}
		.toggle-track {
			position: relative;
			display: flex;
			align-items: center;
			width: calc(var(--spacing, 0.25rem) * 9);
			height: calc(var(--spacing, 0.25rem) * 5);
			border-radius: var(--radius-full, 9999px);
			background: var(--color-border-default, #d0d0d0);
			transition: background 0.2s var(--ease-out, ease);
			flex-shrink: 0;
		}
		.toggle-track--on { background: var(--color-primary, #4c6ceb); }
		.toggle-thumb {
			position: absolute;
			left: calc(var(--spacing, 0.25rem) * 0.5);
			width: calc(var(--spacing, 0.25rem) * 4);
			height: calc(var(--spacing, 0.25rem) * 4);
			border-radius: var(--radius-full, 9999px);
			background: var(--color-base-100, #ffffff);
			box-shadow: var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.2));
			transition: transform 0.2s var(--ease-out, ease);
		}
		.toggle-thumb--on { transform: translateX(calc(var(--spacing, 0.25rem) * 4)); }
		.toggle-label { font-size: var(--text-sm, 0.875rem); color: var(--color-base-content, #000000); }

		/* ── Radio ─────────────────────────────────────────────────────────── */
		.radio-group {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 1.5);
		}
		/* Inline radio options at wider widths */
		@container panel (min-width: 480px) {
			.radio-group { flex-direction: row; flex-wrap: wrap; gap: calc(var(--spacing, 0.25rem) * 2) calc(var(--spacing, 0.25rem) * 4); }
		}
		.radio-row {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			cursor: pointer;
		}
		.custom-radio {
			display: flex;
			align-items: center;
			justify-content: center;
			width: calc(var(--spacing, 0.25rem) * 4.5);
			height: calc(var(--spacing, 0.25rem) * 4.5);
			min-width: calc(var(--spacing, 0.25rem) * 4.5);
			border-radius: var(--radius-full, 9999px);
			border: 1.5px solid var(--color-border-default, #d0d0d0);
			background: var(--color-base-100, #ffffff);
			transition: background var(--duration-xs, 150ms) var(--ease-low-accel, ease), border-color var(--duration-xs, 150ms) var(--ease-low-accel, ease);
		}
		.custom-radio--checked {
			border-color: var(--color-primary, #4c6ceb);
			background: var(--color-primary, #4c6ceb);
			box-shadow: inset 0 0 0 3px var(--color-base-100, #ffffff);
		}
		.radio-label { font-size: var(--text-sm, 0.875rem); color: var(--color-base-content, #000000); }

		/* ── Multiselect ───────────────────────────────────────────────────── */
		.multi-group { display: flex; flex-direction: column; gap: calc(var(--spacing, 0.25rem) * 1.5); }
		@container panel (min-width: 480px) {
			.multi-group { flex-direction: row; flex-wrap: wrap; gap: calc(var(--spacing, 0.25rem) * 1.5) calc(var(--spacing, 0.25rem) * 4); }
		}
		.multi-row { display: flex; align-items: center; gap: calc(var(--spacing, 0.25rem) * 2.5); cursor: pointer; }
		.multi-option-label { font-size: var(--text-sm, 0.875rem); color: var(--color-base-content, #000000); }
		.multi-tags {
			display: flex;
			flex-wrap: wrap;
			gap: calc(var(--spacing, 0.25rem) * 1);
			margin-top: calc(var(--spacing, 0.25rem) * 2);
			grid-column: 1 / -1;
		}
		.multi-tag {
			display: inline-flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1);
			padding: calc(var(--spacing, 0.25rem) * 0.5) calc(var(--spacing, 0.25rem) * 2);
			background: var(--color-primary-light, #eef2ff);
			color: var(--color-primary, #4c6ceb);
			border-radius: var(--radius-full, 9999px);
			font-size: var(--text-xs, 0.75rem);
			font-weight: var(--font-weight-medium, 500);
		}
		.multi-tag-remove {
			background: none;
			border: none;
			color: var(--color-primary, #4c6ceb);
			cursor: pointer;
			padding: 0;
			font-size: var(--text-sm, 0.875rem);
			line-height: 1;
			opacity: 0.7;
		}
		.multi-tag-remove:hover { opacity: 1; }

		/* ── Pill Select ───────────────────────────────────────────────────── */
		.pill-select { position: relative; display: flex; flex-direction: column; gap: calc(var(--spacing, 0.25rem) * 1.5); }
		.pill-tags {
			display: flex;
			flex-wrap: wrap;
			gap: calc(var(--spacing, 0.25rem) * 1.5);
		}
		.pill-tag {
			max-width: 100%;
			overflow: hidden;
		}
		.pill-tag-label {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			min-width: 0;
		}
		.pill-remove {
			background: none;
			border: none;
			color: inherit;
			flex-shrink: 0;
			cursor: pointer;
			padding: 0;
			font-size: var(--text-sm, 0.875rem);
			line-height: 1;
			opacity: 0.7;
		}
		.pill-remove:hover { opacity: 1; }
		.pill-search-wrap { position: relative; }
		.pill-dropdown {
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			max-height: 180px;
			overflow-y: auto;
			background: var(--color-base-100, #ffffff);
			border: 1px solid var(--color-border-subtle, #e0e0e0);
			border-radius: var(--radius-lg, 0.5rem);
			box-shadow: var(--shadow-lg, 0 4px 16px rgba(0,0,0,0.1));
			list-style: none;
			margin: calc(var(--spacing, 0.25rem) * 1) 0 0;
			padding: calc(var(--spacing, 0.25rem) * 1) 0;
			z-index: 100;
		}
		.pill-dropdown-item {
			padding: calc(var(--spacing, 0.25rem) * 2) calc(var(--spacing, 0.25rem) * 3);
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content, #000000);
			cursor: pointer;
			transition: background 0.1s var(--ease-out, ease);
		}
		.pill-dropdown-item:hover,
		.pill-dropdown-item--active { background: var(--color-base-200, #f3f3f3); }
		.pill-dropdown-empty {
			padding: calc(var(--spacing, 0.25rem) * 3);
			font-size: var(--text-xs, 0.75rem);
			color: var(--color-base-content-secondary, #656462);
			text-align: center;
		}

		/* ── Color ─────────────────────────────────────────────────────────── */
		.color-row { display: flex; align-items: center; gap: calc(var(--spacing, 0.25rem) * 2); }
		.color-swatch {
			width: calc(var(--spacing, 0.25rem) * 9);
			height: calc(var(--spacing, 0.25rem) * 8);
			border: 1px solid var(--color-border-subtle, #e0e0e0);
			border-radius: var(--radius-lg, 0.5rem);
			padding: calc(var(--spacing, 0.25rem) * 0.5);
			cursor: pointer;
			background: var(--color-base-100, #ffffff);
			flex-shrink: 0;
		}
		.color-text { flex: 1; font-family: var(--font-mono, monospace); font-size: var(--text-sm, 0.875rem); min-width: 0; }

		/* ── Error / help ──────────────────────────────────────────────────── */
		.error-row {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1);
			margin-top: calc(var(--spacing, 0.25rem) * 1);
			color: var(--color-error, #be0003);
			font-size: var(--text-xs, 0.75rem);
		}
		.help-text { margin: calc(var(--spacing, 0.25rem) * 1) 0 0; font-size: var(--text-xs, 0.75rem); color: var(--color-base-content-secondary, #656462); }

		/* ── Empty state ───────────────────────────────────────────────────── */
		.panel-empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			flex: 1;
			gap: calc(var(--spacing, 0.25rem) * 2);
			padding: calc(var(--spacing, 0.25rem) * 6) calc(var(--spacing, 0.25rem) * 4);
			color: var(--color-base-content-secondary, #656462);
		}
		.panel-empty-title {
			font-size: var(--text-xs, 0.75rem);
			font-weight: var(--font-weight-medium, 500);
			color: var(--color-base-content-secondary, #4d4c4b);
			margin: 0;
		}
		.panel-empty-desc {
			font-size: var(--text-xs, 0.75rem);
			text-align: center;
			margin: 0;
		}

		/* ── Footer ────────────────────────────────────────────────────────── */
		.panel-footer {
			padding: calc(var(--spacing, 0.25rem) * 3) calc(var(--spacing, 0.25rem) * 4);
			border-top: 1px solid var(--color-border-subtle, #f0f0f0);
			flex-shrink: 0;
		}
		.footer-action-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			width: 100%;
			height: calc(var(--spacing, 0.25rem) * 10);
			border: none;
			border-radius: var(--radius-xl, 0.75rem);
			color: var(--color-base-100, #ffffff);
			font-size: var(--text-sm, 0.875rem);
			font-weight: var(--font-weight-medium, 500);
			cursor: pointer;
			transition: opacity 0.15s var(--ease-out, ease);
		}
		.footer-action-btn:hover:not([disabled]) {
			opacity: 0.9;
		}
		.footer-action-btn[disabled] {
			opacity: 0.6;
			cursor: not-allowed;
		}

		/* ── Script runner tabs ────────────────────────────────────────────── */
		.script-tabs {
			padding: calc(var(--spacing, 0.25rem) * 3) calc(var(--spacing, 0.25rem) * 4) 0;
			flex-shrink: 0;
		}
		.script-tabs .aiux-tabs {
			width: 100%;
			padding: calc(var(--spacing, 0.25rem) * 1);
			border-radius: var(--radius-xl, 0.75rem);
		}
		.script-tabs .aiux-tab {
			flex: 1;
			justify-content: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			border-radius: calc(var(--radius-xl, 0.75rem) - calc(var(--spacing, 0.25rem) * 1));
		}

		/* ── Script input area ─────────────────────────────────────────────── */
		.script-input-area {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 4);
			padding: calc(var(--spacing, 0.25rem) * 4) calc(var(--spacing, 0.25rem) * 4);
			flex: 1;
			overflow-y: auto;
		}
		.script-fieldset {
			border: none;
			padding: 0;
			margin: 0;
		}
		.script-fieldset-header {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1.5);
			margin-bottom: calc(var(--spacing, 0.25rem) * 2);
		}
		.script-fieldset-legend {
			font-size: var(--text-xs, 0.75rem);
			font-weight: var(--font-weight-medium, 500);
			color: var(--color-base-content, #000000);
		}
		.script-textarea {
			width: 100%;
			min-height: calc(var(--spacing, 0.25rem) * 19);
			padding: calc(var(--spacing, 0.25rem) * 3);
			border: 1px solid var(--color-border-subtle, #e0e0e0);
			border-radius: var(--radius-xl, 0.75rem);
			font-size: var(--text-xs, 0.75rem);
			font-family: var(--font-mono, monospace);
			line-height: 1.5;
			color: var(--color-base-content, #000000);
			background: var(--color-base-100, #ffffff);
			outline: none;
			resize: none;
			box-sizing: border-box;
			transition: border-color 0.15s var(--ease-out, ease);
		}
		.script-textarea:focus {
			border-color: var(--color-primary, #4c6ceb);
			box-shadow: 0 0 0 2px rgba(76,108,235,0.12);
		}
		.script-textarea::placeholder {
			color: var(--color-base-400, #9ca3af);
		}
		.script-hint {
			font-size: var(--text-xs, 0.75rem);
			color: var(--color-base-content-secondary, #656462);
			margin: calc(var(--spacing, 0.25rem) * 1) 0 0;
		}

		/* ── Script output area ────────────────────────────────────────────── */
		.script-output-empty {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			flex: 1;
			gap: calc(var(--spacing, 0.25rem) * 2);
			padding: calc(var(--spacing, 0.25rem) * 6) calc(var(--spacing, 0.25rem) * 4);
			color: var(--color-base-content-secondary, #656462);
		}
		.script-output-area {
			flex: 1;
			overflow-y: auto;
			padding: calc(var(--spacing, 0.25rem) * 4) calc(var(--spacing, 0.25rem) * 4);
		}
		.script-output-pre {
			font-size: var(--text-xs, 0.75rem);
			font-family: var(--font-mono, monospace);
			color: var(--color-success, #298317);
			background: var(--color-success-light, #f4faf3);
			border-radius: var(--radius-lg, 0.5rem);
			padding: calc(var(--spacing, 0.25rem) * 3);
			line-height: 1.6;
			white-space: pre-wrap;
			word-break: break-word;
			margin: 0;
		}
		.script-output-pre--error {
			color: var(--color-error, #ef4444);
			background: var(--color-error-light, #fef2f2);
		}

		/* ── Script spinner ────────────────────────────────────────────────── */
		.script-spinner {
			width: calc(var(--spacing, 0.25rem) * 6);
			height: calc(var(--spacing, 0.25rem) * 6);
			border: 2px solid var(--color-border-subtle, #e0e0e0);
			border-top-color: var(--color-success, #298317);
			border-radius: var(--radius-full, 9999px);
			animation: panelSpin 0.8s linear infinite;
		}
		@keyframes panelSpin {
			to { transform: rotate(360deg); }
		}

		/* ── Accessibility ─────────────────────────────────────────────────── */
		.sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0,0,0,0);
			white-space: nowrap;
		}
		/* ── Loading skeleton ────────────────────────────────────────────── */
		.loading-skeleton {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 5);
			padding: calc(var(--spacing, 0.25rem) * 4);
		}
		.skeleton-field {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 2);
		}
		.skeleton-label {
			width: 35%;
			height: 12px;
			border-radius: var(--radius-sm, 0.25rem);
			background: var(--color-base-200, #e5e7eb);
			animation: skeletonPulse 1.5s ease-in-out infinite;
		}
		.skeleton-input {
			width: 100%;
			height: 36px;
			border-radius: var(--radius-md, 0.375rem);
			background: var(--color-base-200, #e5e7eb);
			animation: skeletonPulse 1.5s ease-in-out 0.1s infinite;
		}
		@keyframes skeletonPulse {
			0%, 100% { opacity: 1; }
			50% { opacity: 0.4; }
		}

		@media (prefers-reduced-motion: reduce) {
			.toggle-thumb, .toggle-track,
			.custom-checkbox, .custom-radio,
			.close-btn, .field-input, .field-textarea, .select-wrapper,
			.footer-action-btn, .aiux-tab, .script-textarea, .script-spinner {
				transition: none;
			}
			.script-spinner, .skeleton-label, .skeleton-input {
				animation: none;
			}
		}

		.icon-secondary { color: var(--color-base-content-secondary, #475569); }
		.icon-error { color: var(--color-error, #be0003); }
		.icon-on-filled { color: white; }
		.icon-muted { opacity: 0.4; }
		.error-message { color: var(--color-error, #be0003); font-size: var(--text-xs, 0.75rem); }
		.script-status-text { font-size: var(--text-xs, 0.75rem); }
		.script-status-text--label { font-weight: var(--font-weight-medium, 500); color: var(--color-base-content-secondary, #4d4c4b); }
		.script-status-text--hint { text-align: center; }

		/* ── Tooltip ───────────────────────────────────────────────────────── */
		.aiux-tooltip-content {
			width: 14rem;
		}

	`;
}
