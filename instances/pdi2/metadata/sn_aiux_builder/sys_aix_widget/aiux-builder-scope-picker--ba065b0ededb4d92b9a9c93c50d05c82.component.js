import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n } from '@servicenow/aiux-services';
import { snHttp } from '@servicenow/aiux-utils';


/**
 * AIUX Builder Scope Picker
 *
 * Self-contained searchable dropdown for selecting a ServiceNow application scope.
 * Native shadow DOM dropdown — no portal, no DS dependency.
 *
 * @fires wb-scope-change - Dispatched on window when scope changes (detail: { sysId, name, scopeName })
 */
class AiuxBuilderScopePicker extends AIUXWidgetElement {
	static properties = {
		_scopeOptions: { type: Array, state: true },
		_currentScope: { type: String, state: true },
		_loading: { type: Boolean, state: true },
		_isOpen: { type: Boolean, state: true },
		_searchQuery: { type: String, state: true },
		_highlightIdx: { type: Number, state: true },
	};

	constructor() {
		super();
		this._scopeOptions = [];
		this._currentScope = '';
		this._loading = false;
		this._isOpen = false;
		this._searchQuery = '';
		this._highlightIdx = 0;
		this._boundDocClick = this._handleDocumentClick.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		document.addEventListener('mousedown', this._boundDocClick);
		this._fetchScopes();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener('mousedown', this._boundDocClick);
	}

	// ── Data fetching ────────────────────────────────────────────────────

	async _fetchScopes() {
		this._loading = true;
		try {
			const res = await snHttp.get('/api/now/ui/concoursepicker/application');
			const { current, list } = res.data?.result || {};

			this._currentScope = current || '';
			this._scopeOptions = (list || []).map(item => ({
				value: item.sysId,
				label: item.name,
			}));

			if (current) {
				const match = (list || []).find(item => item.sysId === current);
				const scopeDetail = {
					sysId: current,
					name: match?.name || '',
					scopeName: match?.scopeName || '',
				};
				window.AIUX_CURRENT_SCOPE = scopeDetail;
				window.dispatchEvent(new CustomEvent('wb-scope-change', {
					detail: scopeDetail,
				}));
			}
		} catch (err) {
			console.error('[ScopePicker] Failed to fetch scopes:', err);
			this._scopeOptions = [];
		} finally {
			this._loading = false;
		}
	}

	async _pick(scopeId) {
		if (!scopeId || scopeId === this._currentScope) {
			this._close();
			return;
		}

		this._close();
		const selectedOpt = this._scopeOptions.find(o => o.value === scopeId);
		this._currentScope = scopeId;

		try {
			await snHttp.put('/api/now/ui/concoursepicker/application', { data: { app_id: scopeId } });

			const scopeDetail = {
				sysId: scopeId,
				name: selectedOpt?.label || '',
				scopeName: selectedOpt?.label || '',
			};
			window.AIUX_CURRENT_SCOPE = scopeDetail;
			window.dispatchEvent(new CustomEvent('wb-scope-change', {
				detail: scopeDetail,
			}));
		} catch (err) {
			console.error('[ScopePicker] Failed to switch scope:', err);
		}
	}

	// ── Computed ─────────────────────────────────────────────────────────

	get _selected() {
		return this._scopeOptions.find(o => o.value === this._currentScope) || null;
	}

	get _isGlobal() {
		return (this._selected?.label || '').toLowerCase() === 'global';
	}

	get _filtered() {
		const q = (this._searchQuery || '').trim().toLowerCase();
		const all = this._scopeOptions;
		return q ? all.filter(s => (s.label || '').toLowerCase().includes(q)) : all;
	}

	// ── Interactions ─────────────────────────────────────────────────────

	_toggle() {
		if (this._isOpen) {
			this._close();
		} else {
			this._isOpen = true;
			this._searchQuery = '';
			this._highlightIdx = 0;
			this.updateComplete.then(() => {
				this.renderRoot.querySelector('.sp-search')?.focus();
			});
		}
	}

	_close() {
		this._isOpen = false;
	}

	_handleSearch(e) {
		this._searchQuery = e.target.value;
		this._highlightIdx = 0;
	}

	_handleKeyDown(e) {
		const items = this._filtered;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			this._highlightIdx = Math.min(this._highlightIdx + 1, items.length - 1);
			this._scrollHighlightIntoView();
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			this._highlightIdx = Math.max(this._highlightIdx - 1, 0);
			this._scrollHighlightIntoView();
		} else if (e.key === 'Enter' && items[this._highlightIdx]) {
			this._pick(items[this._highlightIdx].value);
		} else if (e.key === 'Escape') {
			this._close();
			this.renderRoot.querySelector('.sp-trigger')?.focus();
		}
	}

	_scrollHighlightIntoView() {
		this.updateComplete.then(() => {
			this.renderRoot.querySelector('.sp-option--highlight')?.scrollIntoView({ block: 'nearest' });
		});
	}

	_handleDocumentClick(e) {
		if (this._isOpen && !e.composedPath().includes(this)) {
			this._close();
		}
	}

	// ── Render ───────────────────────────────────────────────────────────

	render() {
		if (this._loading && this._scopeOptions.length === 0) {
			return html`<div class="loading">${i18n.getMessage('Loading scopes...')}</div>`;
		}
		if (this._scopeOptions.length <= 1) return nothing;

		const label = this._selected?.label || i18n.getMessage('Select scope');
		const items = this._filtered;
		const total = this._scopeOptions.length;

		return html`
			<div class="sp-root">
				<button
					class="sp-trigger"
					aria-haspopup="listbox"
					aria-expanded="${this._isOpen}"
					aria-label="${i18n.getMessage('Select scope')}: ${label}"
					@click=${this._toggle}
				>
					<span class="trigger-icon ${this._isGlobal ? '' : 'trigger-icon--scoped'}" aria-hidden="true">
						<aiux-icon name="${this._isGlobal ? 'globe-outline' : 'window-outline'}" size="sm"></aiux-icon>
					</span>
					<span class="trigger-name">${label}</span>
					<span class="trigger-chevron">
						<aiux-icon name="chevron-down-outline" size="xs" class="chevron ${this._isOpen ? 'chevron--open' : ''}"></aiux-icon>
					</span>
				</button>

				${this._isOpen ? html`
					<div class="sp-dropdown" @keydown=${this._handleKeyDown}>
						<div class="sp-search-wrap">
							<input
								class="aiux-input aiux-input-md sp-search"
								type="text"
								autocomplete="off"
								placeholder="${i18n.getMessage('Search scopes...')}"
								.value=${this._searchQuery}
								@input=${this._handleSearch}
							/>
						</div>
						<div class="sp-section-label">${i18n.getMessage('Scope')}</div>
						<div class="sp-list" role="listbox" aria-label="${i18n.getMessage('Scopes')}">
							${items.length === 0
								? html`<div class="sp-empty">${i18n.getMessage('No scopes found')}</div>`
								: items.map((scope, idx) => {
									const isSelected = scope.value === this._currentScope;
									const isHighlighted = idx === this._highlightIdx;
									return html`
										<button
											class="sp-option ${isHighlighted ? 'sp-option--highlight' : ''}"
											role="option"
											aria-selected="${isSelected}"
											@click=${() => this._pick(scope.value)}
											@mouseenter=${() => { this._highlightIdx = idx; }}
										>
											<span class="sp-check-col">
												${isSelected ? html`<aiux-icon name="check-outline" size="xs"></aiux-icon>` : nothing}
											</span>
											<span class="sp-option-label ${isSelected ? 'sp-option-label--selected' : ''}">${scope.label}</span>
											${(scope.label || '').toLowerCase() === 'global' ? html`
												<span class="aiux-btn aiux-btn-ghost aiux-btn-circle aiux-btn-xs" tabindex="-1">
													<aiux-icon name="globe-outline" size="md"></aiux-icon>
												</span>
											` : nothing}
										</button>
									`;
								})
							}
						</div>
						<div class="sp-footer">
							<span class="sp-footer-count">${i18n.getMessage('{0} of {1} scopes', [items.length, total])}</span>
						</div>
					</div>
				` : nothing}
			</div>
		`;
	}

	// ── Styles ───────────────────────────────────────────────────────────

	static styles = css`
		:host {
			display: block;
			position: relative;
			font-family: var(--font-sans, Inter);
		}

		@media (prefers-reduced-motion: reduce) {
			.chevron { transition: none !important; }
		}

		/* ── Root ── */
		.sp-root {
			position: relative;
			display: inline-block;
		}

		/* ── Trigger button ── */
		.sp-trigger {
			display: inline-flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			height: calc(var(--spacing, 0.25rem) * 10);
			padding: 0 calc(var(--spacing, 0.25rem) * 3.5);
			border-radius: var(--radius-xl, 0.75rem);
			border: none;
			background: var(--neutral-300);
			cursor: pointer;
			outline: none;
			user-select: none;
			transition: background 0.15s var(--ease-out, ease);
		}
		.sp-trigger:hover {
			background: var(--color-base-300, #e5e7eb);
		}
		.sp-trigger:focus-visible {
			outline: 2px solid var(--color-primary, #3b82f6);
			outline-offset: 2px;
		}

		.trigger-icon {
			display: flex;
			align-items: center;
			color: var(--color-base-content, rgba(0,0,0,0.82));
			flex-shrink: 0;
		}
		.trigger-icon--scoped {
			color: var(--color-error, #ef4444);
		}

		.trigger-name {
			font-size: var(--text-sm, 0.875rem);
			font-weight: var(--font-weight-medium, 500);
			line-height: 1;
			color: var(--color-base-content, rgba(0,0,0,0.82));
			white-space: nowrap;
		}

		.trigger-chevron {
			display: flex;
			align-items: center;
			color: var(--color-base-content-secondary, rgba(0,0,0,0.4));
		}
		.chevron {
			transition: transform 0.3s var(--ease-out, ease);
		}
		.chevron--open {
			transform: rotate(180deg);
		}

		/* ── Dropdown ── */
		.sp-dropdown {
			position: absolute;
			top: calc(100% + calc(var(--spacing, 0.25rem) * 2));
			right: 0;
			width: 280px;
			z-index: 99999;
			border-radius: var(--radius-2xl, 1rem);
			overflow: hidden;
			background: var(--color-base-100, #ffffff);
			color: var(--color-base-content, #1e293b);
			border: 1px solid rgba(0,0,0,0.08);
			box-shadow: 0 20px 60px -12px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.08);
			animation: sp-fade-in 0.15s ease;
		}

		@keyframes sp-fade-in {
			from { opacity: 0; transform: translateY(-6px); }
			to { opacity: 1; transform: translateY(0); }
		}

		/* ── Search ── */
		.sp-search-wrap {
			padding: calc(var(--spacing, 0.25rem) * 2.5) calc(var(--spacing, 0.25rem) * 2.5) calc(var(--spacing, 0.25rem) * 2);
		}
		.sp-search {
			width: 100%;
			box-sizing: border-box;
		}

		/* ── Section label ── */
		.sp-section-label {
			padding: calc(var(--spacing, 0.25rem) * 1) calc(var(--spacing, 0.25rem) * 3);
			font-size: var(--text-xs, 0.75rem);
			font-weight: var(--font-weight-medium, 500);
			color: var(--color-base-content-secondary, #9ca3af);
			letter-spacing: 0.04em;
		}

		/* ── List ── */
		.sp-list {
			padding: 0 calc(var(--spacing, 0.25rem) * 1.5) calc(var(--spacing, 0.25rem) * 1.5);
			max-height: 240px;
			overflow-y: auto;
		}

		.sp-empty {
			padding: calc(var(--spacing, 0.25rem) * 8) calc(var(--spacing, 0.25rem) * 3);
			text-align: center;
			font-size: var(--text-sm, 0.875rem);
			font-weight: var(--font-weight-medium, 500);
			color: var(--color-base-content-secondary, #94a3b8);
		}

		/* ── Option ── */
		.sp-option {
			width: 100%;
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			padding: calc(var(--spacing, 0.25rem) * 2) calc(var(--spacing, 0.25rem) * 2.5);
			border-radius: var(--radius-lg, 0.5rem);
			text-align: start;
			cursor: pointer;
			background: transparent;
			border: none;
			outline: none;
			font-family: inherit;
			box-sizing: border-box;
		}
		.sp-option:hover,
		.sp-option--highlight {
			background: var(--color-base-200, #f3f4f6);
		}

		.sp-check-col {
			width: calc(var(--spacing, 0.25rem) * 4);
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--color-primary);
		}

		.sp-option-label {
			flex: 1;
			font-size: var(--text-sm, 0.875rem);
			font-weight: var(--font-weight-normal, 400);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: var(--color-base-content, #334155);
		}
		.sp-option-label--selected {
			font-weight: var(--font-weight-semibold, 600);
			color: var(--color-base-content, #0f172a);
		}

		/* ── Footer ── */
		.sp-footer {
			padding: calc(var(--spacing, 0.25rem) * 1.75) calc(var(--spacing, 0.25rem) * 3.5) calc(var(--spacing, 0.25rem) * 2);
		}
		.sp-footer-count {
			font-size: var(--text-xs, 0.75rem);
			font-weight: var(--font-weight-medium, 500);
			letter-spacing: 0.04em;
			color: var(--color-base-content-secondary, #9ca3af);
		}

		.loading {
			font-size: var(--text-xs, 0.8125rem);
			color: var(--color-base-content-secondary, #6b7280);
			padding: calc(var(--spacing, 0.25rem) * 1.5) 0;
		}
	`;
}
