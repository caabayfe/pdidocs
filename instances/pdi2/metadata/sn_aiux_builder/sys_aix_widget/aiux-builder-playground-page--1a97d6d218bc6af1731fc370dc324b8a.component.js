import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { locationService, i18n } from '@servicenow/aiux-services';
import { snHttp } from '@servicenow/aiux-utils';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-chat-panel';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-widget-editor';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-property-panel';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-entity-service';

/**
 * AIUX Builder Playground Page
 *
 * Composite page widget for widget development playground.
 * 3-panel resizable layout:
 *   - Left: AI chat panel (chat-panel-v2)
 *   - Center: Widget editor with Preview/Component/Script tabs (wb-widget-editor)
 *   - Right: Property panel (property-panel-v2)
 *
 * No top header - each panel is self-contained with its own header.
 *
 * @fires wb-playground-save - When save is triggered
 * @fires wb-playground-code-change - When code changes in editor
 */
class AiuxBuilderPlayground extends AIUXWidgetElement {
	static properties = {
		/** Widget ID being edited (from route param) */
		widgetId: { type: String, attribute: 'widget-id' },
		/** Widget data loaded from entity service */
		_widget: { type: Object, state: true },
		/** Loading state */
		_loading: { type: Boolean, state: true },
		/** Whether right panel is visible */
		_propertiesOpen: { type: Boolean, state: true },
		/** Right panel mode: 'properties' | 'settings' | 'preview-props' | 'script-runner' */
		_panelMode: { type: String, state: true },
		/** Whether chat panel is visible */
		_chatOpen: { type: Boolean, state: true },
		/** Dirty state for unsaved changes */
		_isDirty: { type: Boolean, state: true },
		/** Left panel width */
		_leftWidth: { type: Number, state: true },
		/** Right panel width */
		_rightWidth: { type: Number, state: true },
		/** Currently resizing panel */
		_resizing: { type: String, state: true },
		/** Fetched choice options for select fields */
		_choices: { type: Object, state: true },
		/** Whether the logged-in user has write access to sys_aix_widget */
		_hasEditAccess: { type: Boolean, state: true },
		/** Whether the Chat/AI feature is available (plugin installed + skills active) */
		_skillAvailable: { type: Boolean, state: true },
		/** Whether AI is generating — disables controls */
		_isGenerating: { type: Boolean, state: true },
	};

	constructor() {
		super();
		this.widgetId = '';
		this._widget = null;
		this._loading = true;
		this._propertiesOpen = true;
		this._panelMode = 'settings';
		this._chatOpen = false;
		this._isDirty = false;
		this._leftWidth = 420;
		this._rightWidth = 350;
		this._resizing = null;
		this._choices = { category: [], roles: [] };
		this._isGenerating = false;
		// Snapshot of property values at last save/load — for dirty comparison
		this._savedPropertyValues = null;
		this._hasEditAccess = false;
		this._skillAvailable = false;
		this._handlingChatUpdate = false;
	}

	connectedCallback() {
		super.connectedCallback();

		// Initial read from base class auto-fetch (no widgetId — hasEditAccess is unreliable here)
		this._skillAvailable = !!this.data?.isAIChatAvailable;

		// Bind resize handlers
		this._boundMouseMove = this._handleMouseMove.bind(this);
		this._boundMouseUp = this._handleMouseUp.bind(this);

		// Extract widgetId from route: /edit/widget/:widgetId
		this._routeUnsubscribe = locationService.subscribe((route) => {
			const page = route?.page || '';
			const segments = page.split('/').filter(Boolean);
			// Route: edit/widget/<sys_id>
			if (segments[0] === 'edit' && segments[1] === 'widget' && segments[2]) {
				const routeWidgetId = segments[2];
				if (routeWidgetId !== this.widgetId) {
					this.widgetId = routeWidgetId;
					this.server.update({ widgetId: routeWidgetId }).then(() => {
						this._hasEditAccess = !!this.data?.hasEditAccess;
						this._skillAvailable = !!this.data?.isAIChatAvailable;
						if (this._skillAvailable && this._hasEditAccess && !this._chatOpen) {
							this._chatOpen = true;
						}
					});
					if (routeWidgetId === '-1') {
						this._loadDummyWidget();
					} else {
						this._loadWidget();
					}
				}
			}
		});

		// Also try from attribute if already set
		if (this.widgetId) {
			this.server.update({ widgetId: this.widgetId }).then(() => {
				this._hasEditAccess = !!this.data?.hasEditAccess;
				this._skillAvailable = !!this.data?.isAIChatAvailable;
				if (this._skillAvailable && this._hasEditAccess && !this._chatOpen) {
					this._chatOpen = true;
				}
			});
			if (this.widgetId === '-1') {
				this._loadDummyWidget();
			} else {
				this._loadWidget();
			}
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener('mousemove', this._boundMouseMove);
		document.removeEventListener('mouseup', this._boundMouseUp);
		if (this._routeUnsubscribe) {
			this._routeUnsubscribe();
			this._routeUnsubscribe = null;
		}
	}

	/** Load a dummy in-memory widget for the creation placeholder route (-1) */
	_loadDummyWidget() {
		const dummyId = i18n.getMessage('untitled-widget');
		const dummyName = i18n.getMessage('untitled widget');
		this._widget = {
			sys_id: '',
			id: dummyId,
			name: dummyName,
			widgetId: dummyId,
			description: '',
			category: 'custom',
			type: '',
			sys_policy: '',
			sys_scope: '',
			servicenow: 'false',
			chat_compatible: 'false',
			interactive_view_compatible: 'false',
			best_for: '',
			roles: '',
			component: this._getDefaultComponent(dummyId, dummyName),
			script: '',
			input_schema: '',
		};
		this._loading = false;
		this._propertiesOpen = false;
	}

	_getDefaultComponent(elementId, displayName) {
		const className = elementId
			.split('-')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('');

		return `import { html, css } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';

/**
 * ${displayName}
 *
 * @property {String} title - Widget title
 */
class ${className} extends AIUXWidgetElement {
	static properties = {
		title: { type: String },
	};

	constructor() {
		super();
		this.title = '${displayName}';
	}

	render() {
		return html\`
			<div class="widget">
				<h2>\${this.title}</h2>
				<p>Hello from ${displayName}!</p>
			</div>
		\`;
	}

	static styles = css\`
		:host {
			display: block;
			font-family: var(--font-sans, Inter);
		}

		.widget {
			padding: calc(var(--spacing, 0.25rem) * 4);
			border-radius: var(--radius-lg, 0.5rem);
			background: var(--color-base-200, #f8fafc);
		}

		h2 {
			margin: 0 0 calc(var(--spacing, 0.25rem) * 2);
			font-size: var(--text-lg, 1.125rem);
			font-weight: var(--font-weight-semibold, 600);
			color: var(--color-base-content, #1e293b);
		}

		p {
			margin: 0;
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content-secondary, #64748b);
		}
	\`;
}
`;
	}

	async _loadWidget({ silent = false } = {}) {
		if (!this.widgetId) {
			if (!silent) this._loading = false;
			return;
		}

		if (!silent) this._loading = true;
		try {
			// Wait for entity service to be available
			let retries = 0;
			while (!window.aiuxBuilderEntityService && retries < 30) {
				await new Promise(r => setTimeout(r, 100));
				retries++;
			}

			const service = window.aiuxBuilderEntityService;
			if (service) {
				if (this.data?.roles) {
					this._choices = {
						roles: this.data.roles || []
					};
				}

				const widget = await service.get('sys_aix_widget', this.widgetId);
				if (widget) {
					const str = (v) => {
						if (v == null) return '';
						if (typeof v === 'object') return v.value != null ? String(v.value) : '';
						return String(v);
					};
					this._widget = {
						sys_id: widget.sys_id?.value || widget.sys_id,
						id: str(widget.id),
						name: str(widget.name),
						widgetId: str(widget.id),
						description: str(widget.description),
						category: 'custom',
						type: str(widget.type),
						sys_policy: str(widget.sys_policy),
						sys_scope: str(widget.sys_scope),
						servicenow: str(widget.servicenow) || 'false',
						chat_compatible: str(widget.chat_compatible) || 'false',
						interactive_view_compatible: str(widget.interactive_view_compatible) || 'false',
						best_for: str(widget.best_for),
						roles: str(widget.roles),
						component: str(widget.component),
						script: str(widget.script),
						input_schema: str(widget.input_schema),
					};
				} else {
					this._widget = null;
				}
			} else {
				console.warn('[PlaygroundPage] Entity service not available');
				this._widget = null;
			}
		} catch (err) {
			console.error('Failed to load widget:', err);
			this._widget = null;
		} finally {
			if (!silent) this._loading = false;
			// Snapshot baseline after load so dirty comparison is accurate
			this._savedPropertyValues = this._snapshotProps();
			this._isDirty = false;

			// If the creation flow stored fresh component source, apply it via
			// refreshFromSource so the preview shows the AI-generated code
			// instead of waiting for the platform JSDBX cache to update.
			// Skip when silent — the caller (_handleChatWidgetUpdated)
			// manages the preview refresh itself.  Without this guard the
			// chat panel's pending-component key (written after
			// dispatchEvent returns) would trigger a concurrent
			// _loadScopedWidget that corrupts the customElements patch.
			if (!silent) this._applyPendingComponent();
		}
	}

	async _applyPendingComponent() {
		const key = `aiux-pending-component-${this.widgetId}`;
		let componentSource = null;
		try {
			componentSource = sessionStorage.getItem(key);
			if (componentSource) {
				sessionStorage.removeItem(key);
			}
		} catch {}
		if (!componentSource) return;

		// Wait for the editor and preview to render
		await this.updateComplete;
		const editor = this.renderRoot?.querySelector('aiux-widget-editor');
		if (editor) {
			editor.activeTab = 'preview';
			await editor.updateComplete;
		}
		const preview = editor?.renderRoot?.querySelector('aiux-responsive-preview');
		if (preview?.refreshFromSource) {
			preview.refreshFromSource(componentSource);
		}
	}

	// ── Resize Handlers ───────────────────────────────────────────────────

	_startResize(panel, e) {
		e.preventDefault();
		this._resizing = panel;
		this._startX = e.clientX;
		this._startLeftWidth = this._leftWidth;
		this._startRightWidth = this._rightWidth;
		document.addEventListener('mousemove', this._boundMouseMove);
		document.addEventListener('mouseup', this._boundMouseUp);
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	}

	_handleMouseMove(e) {
		if (!this._resizing) return;

		const delta = e.clientX - this._startX;

		if (this._resizing === 'left') {
			const newWidth = Math.max(280, Math.min(500, this._startLeftWidth + delta));
			this._leftWidth = newWidth;
		} else if (this._resizing === 'right') {
			const newWidth = Math.max(280, Math.min(450, this._startRightWidth - delta));
			this._rightWidth = newWidth;
		}
	}

	_handleMouseUp() {
		this._resizing = null;
		document.removeEventListener('mousemove', this._boundMouseMove);
		document.removeEventListener('mouseup', this._boundMouseUp);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	}

	// ── Property Dirty Helpers ────────────────────────────────────────────

	_snapshotProps() {
		if (!this._widget) return null;
		const toBool = (v) => v === true || v === 'true';
		const w = this._widget;
		return {
			name: w.name || '',
			widgetId: w.widgetId || w.id || '',
			description: w.description || '',
			best_for: w.best_for || '',
			category: w.category || 'custom',
			type: w.type || '',
			sys_policy: w.sys_policy || '',
			chat_compatible: toBool(w.chat_compatible),
			interactive_view_compatible: toBool(w.interactive_view_compatible),
			servicenow: toBool(w.servicenow),
			roles: w.roles || '',
		};
	}

	_computePropertyDirty() {
		if (!this._savedPropertyValues || !this._widget) return false;
		const current = this._snapshotProps();
		return Object.keys(current).some(k => current[k] !== this._savedPropertyValues[k]);
	}

	/** True when the editor should be read-only: generating, or non-maint user + widget has a protection policy */
	get _readOnly() {
		// -1 (new widget) is always editable — user can create manually with or without AI
		if (this.widgetId === '-1') return this._isGenerating;
		return !this._hasEditAccess && !!(this._widget?.sys_policy);
	}

	// ── Preview Input Schema (dynamic from widget's input_schema) ────────

	static INPUT_SCHEMA_TYPE_MAP = {
		String:  { type: 'text',     placeholder: '' },
		string:  { type: 'text',     placeholder: '' },
		Number:  { type: 'number',   placeholder: '0' },
		number:  { type: 'number',   placeholder: '0' },
		Integer: { type: 'number',   placeholder: '0', min: 0 },
		integer: { type: 'number',   placeholder: '0', min: 0 },
		Boolean: { type: 'toggle',   defaultValue: false },
		boolean: { type: 'toggle',   defaultValue: false },
		Object:  { type: 'textarea', placeholder: '{}',  rows: 4 },
		object:  { type: 'textarea', placeholder: '{}',  rows: 4 },
		Array:   { type: 'textarea', placeholder: '[]',  rows: 4 },
		array:   { type: 'textarea', placeholder: '[]',  rows: 4 },
		JSON:    { type: 'textarea', placeholder: '{}',  rows: 4 },
		json:    { type: 'textarea', placeholder: '{}',  rows: 4 },
	};

	static _humanize(key) {
		return key
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
			.replace(/^./, c => c.toUpperCase());
	}

	/** Parse the edited widget's input_schema into Property Panel field descriptors */
	get _inputSchemaFields() {
		const raw = this._widget?.input_schema || '';
		if (!raw) return [];
		try {
			const parsed = JSON.parse(raw);
			if (!parsed || typeof parsed !== 'object') return [];

			// Handle JSON Schema format: { type: "object", properties: { ... } }
			const entries = (parsed.type && typeof parsed.properties === 'object')
				? parsed.properties
				: parsed;

			return Object.entries(entries).map(([key, def]) => {
				const typeName = typeof def === 'string' ? def : (def?.type || 'String');
				const defaults = AiuxBuilderPlayground.INPUT_SCHEMA_TYPE_MAP[typeName]
					|| { type: 'textarea', placeholder: '', rows: 3 };

				const field = {
					key,
					label: AiuxBuilderPlayground._humanize(key),
					required: def?.required || false,
					...defaults,
				};

				if (def?.description) {
					field.tooltip = def.description;
				}

				return field;
			});
		} catch (e) {
			return [];
		}
	}

	// ── Event Handlers ────────────────────────────────────────────────────

	_handleEditorSave(e) {
		if (e.detail?.created && e.detail?.widgetId) {
			locationService.navigate(`edit/widget/${e.detail.widgetId}`);
			return;
		}
		if (!e.detail?.success) return;

		this._savedPropertyValues = this._snapshotProps();
		this._isDirty = false;

		this.dispatchEvent(
			new CustomEvent('wb-playground-save', {
				detail: { widget: this._widget },
				bubbles: true,
				composed: true,
			})
		);
	}

	_handlePropertyChange(e) {
		const { key, value } = e.detail || {};
		if (this._widget && key) {
			this._widget = { ...this._widget, [key]: value };
			this._isDirty = this._computePropertyDirty();
		}
	}

	_handlePropertyClose() {
		this._propertiesOpen = false;
		// Sync panel state back to editor so toolbar icon states match
		const editor = this._editor;
		if (editor) {
			editor._panelOpen = false;
		}
	}

	_handleEditorSettings() {
		// Toggle the properties (widget record) view in the right panel
		if (this._propertiesOpen && this._panelMode === 'settings') {
			const editor = this._editor;
			if (editor?._activeTab === 'script') {
				// On script tab, restore Script Runner instead of fully closing
				this._panelMode = 'script-runner';
				if (editor) {
					editor._panelOpen = true;
					editor._panelMode = 'script-runner';
				}
			} else {
				this._propertiesOpen = false;
				if (editor) {
					editor._panelOpen = false;
					editor._panelMode = this._panelMode;
				}
			}
		} else {
			this._panelMode = 'settings';
			this._propertiesOpen = true;
			// Sync editor's panel state so toolbar icons reflect correctly
			const editor = this._editor;
			if (editor) {
				editor._panelOpen = this._propertiesOpen;
				editor._panelMode = this._panelMode;
			}
		}
	}

	_handleEditorPanelToggle(e) {
		const { open, mode } = e.detail;
		this._propertiesOpen = open;
		if (mode) this._panelMode = mode;
	}

	_handlePanelClose() {
		const editor = this._editor;
		if (editor?._activeTab === 'script') {
			// On script tab, restore Script Runner instead of fully closing.
			this._panelMode = 'script-runner';
			if (editor) {
				editor._panelOpen = true;
				editor._panelMode = 'script-runner';
			}
		} else {
			this._propertiesOpen = false;
			if (editor) editor._panelOpen = false;
		}
	}

	_toggleChat() {
		this._chatOpen = !this._chatOpen;
	}

	_toggleProperties() {
		this._propertiesOpen = !this._propertiesOpen;
		// Default to 'properties' when opening via the external toggle button
		if (this._propertiesOpen && !this._panelMode) {
			this._panelMode = 'settings';
		}
	}

	async _handleChatSubmit(e) {
		// Switch to preview tab and show skeleton loader while AI is working
		this._isGenerating = true;
		const editor = this.renderRoot?.querySelector('aiux-widget-editor');
		if (editor) {
			editor._generating = true;
			editor._previewStale = false;
			editor._activeTab = 'preview';
			editor.requestUpdate();
			await editor.updateComplete;
			const preview = editor.renderRoot?.querySelector('aiux-responsive-preview');
			if (preview?.refresh) {
				preview.refresh({ showLoader: true });
			}
		}
	}

	async _handleChatWidgetUpdated(e) {
		this._handlingChatUpdate = true;
		let didSetEditorSaving = false;
		try {
			const { sysId, component } = e.detail || {};
			const wasCreation = this.widgetId === '-1' && !!sysId;
			// If we were on the placeholder -1 route, update the URL in-place so the
			// chat thread stays intact (no full page reload), then fall through to load
			// the saved widget and refresh the preview.
			// Query the editor early — we need it before history.replaceState
			// to suppress preview auto-loads.
			const editor = this.renderRoot?.querySelector('aiux-widget-editor');

			if (wasCreation) {
				this.trackEvent('Create Widget', { Origin: 'chat', widgetTag: this._widget?.name || sysId });
				// Set widgetId on both playground and editor BEFORE
				// replaceState.  locationService wraps history.replaceState
				// and synchronously fires all route subscriptions.  Both
				// the playground (line 90) and editor (line 155) have
				// subscriptions guarded by `routeWidgetId !== this.widgetId`.
				// By pre-setting the ID, these guards skip the uncontrolled
				// _loadWidget() calls that would:
				//   - playground: set _loading=true (destroys editor element)
				//     then _applyPendingComponent (extra preview load)
				//   - editor: trigger preview updated() with uncompiled JSDBX
				this.widgetId = sysId;
				if (editor) {
					editor._saving = true;
					didSetEditorSaving = true;
					editor.widgetId = sysId;
				}
				try {
					history.replaceState(null, '', location.pathname.replace(/\/edit\/widget\/[^/?#]+/, `/edit/widget/${sysId}`));
				} catch {}
			} else {
				// Track widget update via chat
				this.trackEvent('Update Widget', { Origin: 'chat', widgetTag: this._widget?.name || '' });
			}

			// Reload widget data from DB so platform has latest source.
			// Always silent — skips the _loading toggle that would
			// destroy/recreate the editor element (skeleton flash) and
			// skips _applyPendingComponent (we refresh the preview below).
			await this._loadWidget({ silent: true });

			const source = component || this._widget?.component;
			if (!source) return;

			// Update component source in memory (avoids _loadWidget which
			// sets _loading=true and destroys/recreates the editor element)
			if (this._widget) {
				this._widget = { ...this._widget, component: source };
			}
			this._isGenerating = false;
			if (editor) {
				editor._generating = false;
			}

			// For creation: locationService already triggered editor._loadWidget
			// from replaceState, but it's async.  Await it so
			// _originalWidgetId is set before we proceed to the JSDBX poll.
			if (wasCreation && editor) {
				try { await editor._loadWidget(); } catch {}
				// editor._loadWidget() resets _panelOpen=true, but the
				// playground's _propertiesOpen was set to false by
				// _loadDummyWidget. Mirror the editor's state so the panel
				// actually renders and the gear toggle starts consistent.
				this._propertiesOpen = editor._panelOpen;
				if (editor._panelMode) this._panelMode = editor._panelMode;
			}

			if (editor?._widget) {
				editor._widget = { ...editor._widget, component: source };
			}

			// Switch to preview and refresh — same pattern as refresh button
			if (editor) {
				editor._previewStale = false;
				editor._activeTab = 'preview';
				editor.requestUpdate();
				await editor.updateComplete;
				const preview = editor.renderRoot?.querySelector('aiux-responsive-preview');
				if (preview) preview._loading = false;
				if (wasCreation) {
					// The platform compiles the JSDBX asynchronously after
					// the widget record is created.  Wait for the compiled
					// bundle to become available before triggering the load
					// so the preview doesn't time out on an empty bundle.
					const elementId = editor._originalWidgetId || editor._widget?.id;
					let jsdbxReady = false;
					if (elementId) {
						jsdbxReady = await this._waitForJsdbxReady(elementId, 30000);
					}
					// Remove the pending-component key so a later non-silent
					// _loadWidget → _applyPendingComponent does not trigger a
					// stale second refresh.
					try { sessionStorage.removeItem(`aiux-pending-component-${sysId}`); } catch {}
					editor._saving = false;
					editor.requestUpdate();
					await editor.updateComplete;
					const pv = editor.renderRoot?.querySelector('aiux-responsive-preview');
					if (jsdbxReady && pv?.refresh) {
						pv.refresh();
					}
				} else {
					if (preview?.refreshFromSource) {
						preview.refreshFromSource(source);
					} else if (preview?.refresh) {
						preview.refresh();
					}
				}
			}
		} finally {
			this._handlingChatUpdate = false;
			if (didSetEditorSaving) {
				const ed = this.renderRoot?.querySelector('aiux-widget-editor');
				if (ed) ed._saving = false;
			}
		}
	}

	async _waitForJsdbxReady(elementId, maxWaitMs = 30000) {
		const interval = 1500;
		const attempts = Math.ceil(maxWaitMs / interval);
		for (let i = 0; i < attempts; i++) {
			try {
				const url = '/aix/widget/' + elementId + '.jsdbx?cb=' + Date.now();
				const resp = await snHttp.get(url);
				const text = typeof resp.data === 'string' ? resp.data : '';
				// A compiled bundle should be substantial and contain
				// a define() call to register the widget element.
				if (text.length > 100 && text.includes('.define(')) {
					return true;
				}
			} catch (e) {
				// Request failed — retry on next iteration.
			}
			if (i < attempts - 1) {
				await new Promise(r => setTimeout(r, interval));
			}
		}
		return false;
	}

	_handleChatAction(e) {
		const { action } = e.detail || {};
		this.trackEvent('Undo Widget', { Origin: 'chat', widgetTag: this._widget?.name || '' });
	}

	_handleChatBack() {
		const editor = this.renderRoot?.querySelector('aiux-widget-editor');
		if (editor?._handleBack) {
			editor._handleBack();
		} else {
			locationService.navigate('/widgets');
		}
	}

	async _handleChatError() {
		// Capture before any await — _handleChatWidgetUpdated may clear the
		// flag while we are yielded at editor.updateComplete below.
		const skipRefresh = this._handlingChatUpdate;
		this._isGenerating = false;
		const editor = this.renderRoot?.querySelector('aiux-widget-editor');
		if (editor) {
			editor._generating = false;
			editor._previewStale = false;
			editor.requestUpdate();
			await editor.updateComplete;
			const preview = editor.renderRoot?.querySelector('aiux-responsive-preview');
			if (preview) {
				preview._refreshing = false;
				preview._loading = false;
			}
			// Skip preview refresh if _handleChatWidgetUpdated was in
			// progress when this handler fired — it will refresh the preview
			// itself.  Without this guard the two handlers trigger
			// overlapping _loadScopedWidget calls that corrupt the
			// customElements.define monkey-patch.
			if (!skipRefresh) {
				const source = this._widget?.component;
				if (source) {
					if (preview?.refreshFromSource) {
						preview.refreshFromSource(source);
					} else if (preview?.refresh) {
						preview.refresh();
					}
				}
			}
		}
	}

	/** Get the editor element */
	get _editor() {
		return this.renderRoot?.querySelector('aiux-widget-editor');
	}

	/** Forward preview property changes to editor */
	_handlePreviewPropertyChange(e) {
		const editor = this._editor;
		if (editor) editor._handlePreviewPropertyChange(e);
	}

	/** Forward panel action (apply/run) to editor */
	_handlePanelAction(e) {
		const editor = this._editor;
		if (editor) editor._handlePanelAction(e);
	}

	/** Forward script input changes to editor */
	_handleScriptInputChange(e) {
		const editor = this._editor;
		if (editor) editor._handleScriptInputChange(e);
	}

	/** Forward settings changes to editor AND update parent widget state for save */
	_handleSettingsChange(e) {
		const editor = this._editor;
		if (editor) editor._handleSettingsChange(e);

		// Mirror the update on parent's _widget so _snapshotProps() stays accurate
		const { key, value } = e.detail || {};
		if (key && this._widget) {
			const storeValue = Array.isArray(value) ? value.join(',') : value;
			const updates = { [key]: storeValue };
			// Keep widgetId in sync when custom element name (id) changes
			if (key === 'id') updates.widgetId = storeValue;
			if (key === 'chat_compatible' && !value) {
				updates.interactive_view_compatible = 'false';
			}
			this._widget = { ...this._widget, ...updates };
			// Recompute — if the user reverted to the saved value, dirty should go false
			this._isDirty = this._computePropertyDirty();
		}
		this.requestUpdate();
	}

	async _handleSave() {
		if (!this._widget) return;

		try {
			const service = window.aiuxBuilderEntityService;
			if (service) {
				const w = this._widget;
				const newId = w.widgetId || w.id;
				const txScope = w.sys_scope || '';
				const payload = {
					name: w.name,
					id: newId,
					description: w.description,
					best_for: w.best_for || '',
					category: 'custom',
					type: w.type,
					sys_policy: w.sys_policy,
					chat_compatible: String(w.chat_compatible),
					interactive_view_compatible: String(w.interactive_view_compatible),
					servicenow: String(w.servicenow),
					roles: w.roles || '',
				};
				// Use Table API directly — the widget API (/api/now/aix/widget)
				// doesn't persist widget properties like name, description, etc.
				const params = new URLSearchParams({ sysparm_display_value: 'true' });
				if (txScope) params.set('sysparm_transaction_scope', txScope);
				await snHttp.put(
					`/api/now/table/sys_aix_widget/${w.sys_id}?${params}`,
					{ data: payload }
				);
				// Invalidate entity service caches
				service._invalidateCache('list:sys_aix_widget');
				service._invalidateCache(`get:sys_aix_widget:${w.sys_id}`);
			}
			this._savedPropertyValues = this._snapshotProps();
			this._isDirty = false;

			this.dispatchEvent(
				new CustomEvent('wb-playground-save', {
					detail: { widget: this._widget },
					bubbles: true,
					composed: true,
				})
			);
		} catch (err) {
			console.error('Failed to save widget:', err);
		}
	}

	// ── Render ────────────────────────────────────────────────────────────

	_renderChatPanel() {
		if (!this._skillAvailable || !this._chatOpen || !this._hasEditAccess) return nothing;
		return html`
			<aside class="chat-panel panel-slide-left" style="width: ${this._leftWidth}px;">
				<aiux-chat-panel
					widget-title="${this._widget?.name || i18n.getMessage('Widget')}"
					widget-sys-id="${this._widget?.sys_id || ''}"
					widget-scope="${this._widget?.sys_scope || ''}"
					?read-only=${this._readOnly}
					@wb-chat-submit=${this._handleChatSubmit}
					@wb-chat-action=${this._handleChatAction}
					@wb-chat-updated=${this._handleChatWidgetUpdated}
					@wb-chat-error=${this._handleChatError}
					@wb-chat-back=${this._handleChatBack}
				></aiux-chat-panel>
			</aside>
			<div
				class="resize-handle resize-handle--left"
				@mousedown=${(e) => this._startResize('left', e)}
			></div>
		`;
	}

	_renderWidgetEditor() {
		if (this._loading) {
			return html`
				<div class="editor-skeleton">
					<div class="skel-header">
						<div class="skel-tabs">
							<div class="skel-tab skel-shimmer"></div>
							<div class="skel-tab skel-shimmer"></div>
							<div class="skel-tab skel-shimmer"></div>
						</div>
						<div class="skel-actions">
							<div class="skel-circle skel-shimmer"></div>
							<div class="skel-circle skel-shimmer"></div>
						</div>
					</div>
					<div class="skel-body">
						<div class="skel-line skel-line--wide skel-shimmer"></div>
						<div class="skel-line skel-line--med skel-shimmer"></div>
						<div class="skel-line skel-line--wide skel-shimmer"></div>
						<div class="skel-line skel-line--short skel-shimmer"></div>
						<div class="skel-line skel-line--med skel-shimmer"></div>
						<div class="skel-line skel-line--wide skel-shimmer"></div>
						<div class="skel-line skel-line--short skel-shimmer"></div>
						<div class="skel-line skel-line--med skel-shimmer"></div>
					</div>
				</div>
			`;
		}

		if (!this._widget) {
			return html`
				<div class="empty-state">
					<p>${i18n.getMessage('Widget not found')}</p>
				</div>
			`;
		}

		return html`
			<aiux-widget-editor
				widget-id="${this.widgetId}"
				widget-name="${this._widget?.name || ''}"
				.dirty=${this._isDirty}
				.choices=${this._choices}
				?read-only=${this._readOnly}
				?show-back-button=${!this._skillAvailable || !this._hasEditAccess}
				@wb-editor-save=${(e) => this._handleEditorSave(e)}
				@wb-editor-settings=${(e) => this._handleEditorSettings(e)}
				@wb-editor-panel-toggle=${(e) => this._handleEditorPanelToggle(e)}
				@wb-editor-state-change=${() => this.requestUpdate()}
			></aiux-widget-editor>
		`;
	}

	_renderPropertiesPanel() {
		if (!this._propertiesOpen) return nothing;
		const editor = this._editor;

		// Show loading skeleton until widget data is loaded
		const isWidgetReady = editor?._widget;
		if (!isWidgetReady && (this._panelMode === 'settings' || !this._panelMode)) {
			return html`
				<div
					class="resize-handle resize-handle--right"
					@mousedown=${(e) => this._startResize('right', e)}
				></div>
				<aside class="properties-panel panel-slide-right" style="width: ${this._rightWidth}px;">
					<aiux-property-panel
						panel-title="${i18n.getMessage('Widget Properties')}"
						panel-icon="gear-outline"
						loading
						closable
						?read-only=${this._readOnly}
						@wb-property-close=${this._handlePanelClose}
					></aiux-property-panel>
				</aside>
			`;
		}

		let panelContent;
		switch (this._panelMode) {
			case 'settings':
				panelContent = html`
					<aiux-property-panel
						panel-title="${i18n.getMessage('Widget Properties')}"
						panel-icon="gear-outline"
						.schema=${editor?._widget ? editor._settingsSchema : []}
						.values=${editor?._settingsValues || {}}
						closable
						?read-only=${this._readOnly}
						@wb-property-close=${this._handlePanelClose}
						@wb-property-change=${this._handleSettingsChange}
					></aiux-property-panel>
				`;
				break;
			case 'preview-props':
				panelContent = html`
					<aiux-property-panel
						panel-title="${i18n.getMessage('Preview Inputs')}"
						panel-icon="sliders-outline"
						.schema=${this._inputSchemaFields}
						.values=${editor?._previewInputs || {}}
						closable
						?read-only=${this._readOnly}
						@wb-property-close=${this._handlePanelClose}
						footer-action="apply"
						footer-label="${i18n.getMessage('Apply')}"
						@wb-property-change=${this._handlePreviewPropertyChange}
						@wb-property-action=${this._handlePanelAction}
					></aiux-property-panel>
				`;
				break;
			case 'script-runner':
				panelContent = html`
					<aiux-property-panel
						mode="script-runner"
						panel-title="${i18n.getMessage('Script Runner')}"
						panel-icon="play-outline"
						.optionsJson=${editor?._optionsJson || '{}'}
						.inputJson=${editor?._inputJson || '{}'}
						.output=${editor?._output || ''}
						output-status=${editor?._outputStatus || ''}
						?running=${editor?._running || false}
						.closable=${false}
						?read-only=${this._readOnly}
						footer-action="run"
						?footer-disabled=${!editor?._widget?.script || this._readOnly}
						@wb-property-input-change=${this._handleScriptInputChange}
						@wb-property-action=${this._handlePanelAction}
					></aiux-property-panel>
				`;
				break;
			default: // fallback to settings
				panelContent = html`
					<aiux-property-panel
						panel-title="${i18n.getMessage('Widget Properties')}"
						panel-icon="gear-outline"
						.schema=${editor?._widget ? editor._settingsSchema : []}
						.values=${editor?._settingsValues || {}}
						closable
						?read-only=${this._readOnly}
						@wb-property-close=${this._handlePanelClose}
						@wb-property-change=${this._handleSettingsChange}
					></aiux-property-panel>
				`;
				break;
		}

		return html`
			<div
				class="resize-handle resize-handle--right"
				@mousedown=${(e) => this._startResize('right', e)}
			></div>
			<aside class="properties-panel panel-slide-right" style="width: ${this._rightWidth}px;">
				${panelContent}
			</aside>
		`;
	}

	render() {
		return html`
			<aiux-entity-service .chatOpen=${this._chatOpen} style="display:none;"></aiux-entity-service>
			<div class="playground-root ${this._resizing ? 'resizing' : ''}">
				${this._skillAvailable && !this._chatOpen && this._hasEditAccess ? html`
					<button class="aiux-btn aiux-btn-ghost aiux-btn-circle aiux-btn-sm aiux-tooltip aiux-tooltip-right" data-tip="${i18n.getMessage('Open chat')}" @click=${this._toggleChat}><aiux-icon name="panel-display-left-outline" size="sm"></aiux-icon></button>
				` : nothing}
				${this._renderChatPanel()}
				<main class="canvas-area panel-fade-in">${this._renderWidgetEditor()}</main>
				${this._renderPropertiesPanel()}
			</div>
		`;
	}

	// ── Styles ────────────────────────────────────────────────────────────

	static styles = css`
		:host {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 100vh;
			overflow: hidden;
			font-family: var(--font-sans, Inter);
		}


		/* ── Root ─────────────────────────────────────────────────────────── */
		.playground-root {
			display: flex;
			flex: 1;
			min-height: 0;
			width: 100%;
			background: transparent;
			overflow: hidden;
			padding: calc(var(--spacing, 0.25rem) * 2);
			gap: calc(var(--spacing, 0.25rem) * 2);
			box-sizing: border-box;
		}

		.playground-root.resizing * {
			pointer-events: none;
		}

		.playground-root.resizing .resize-handle {
			pointer-events: auto;
		}

		/* ── Chat Panel (Left) ────────────────────────────────────────────── */
		.chat-panel {
			min-width: 380px;
			max-width: 560px;
			height: 100%;
			background: transparent;
			flex-shrink: 0;
			overflow: hidden;
			display: flex;
			flex-direction: column;
			border-radius: var(--radius-2xl, 1rem);
		}

		.chat-panel aiux-chat-panel {
			display: block;
			flex: 1;
			min-height: 0;
		}

		/* ── Canvas Area (Center) ─────────────────────────────────────────── */
		.canvas-area {
			flex: 1;
			min-width: 400px;
			min-height: 0;
			height: 100%;
			overflow: hidden;
			background: var(--color-base-200, #e8e8e7);
			border-radius: var(--radius-2xl, 1rem);
			box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
		}

		.canvas-area wb-widget-editor {
			display: block;
			width: 100%;
			height: 100%;
		}

		/* ── Properties Panel (Right) ─────────────────────────────────────── */
		.properties-panel {
			min-width: 280px;
			max-width: 450px;
			height: 100%;
			background: var(--color-base-100, #ffffff);
			flex-shrink: 0;
			overflow: visible;
			display: flex;
			flex-direction: column;
			border-radius: var(--radius-2xl, 1rem);
			box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -1px rgba(0, 0, 0, 0.06));
		}

		.properties-panel wb-property-panel {
			display: block;
			flex: 1;
			min-height: 0;
			overflow: auto;
		}

		/* ── Resize Handles ───────────────────────────────────────────────── */
		.resize-handle {
			width: calc(var(--spacing, 0.25rem) * 1.5);
			background: transparent;
			cursor: col-resize;
			flex-shrink: 0;
			position: relative;
			z-index: 10;
			transition: background 0.15s var(--ease-out, ease);
			margin: 0 -3px;
		}

		.resize-handle:hover,
		.resize-handle:active {
			background: color-mix(in srgb, var(--color-primary, #3b82f6) 30%, transparent);
			border-radius: var(--radius-xs, 0.125rem);
		}

		.resize-handle::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			width: calc(var(--spacing, 0.25rem) * 0.5);
			height: calc(var(--spacing, 0.25rem) * 10);
			background: var(--color-border-default, #d0d0d0);
			border-radius: var(--radius-xs, 0.125rem);
			opacity: 0;
			transition: opacity 0.15s var(--ease-out, ease);
		}

		.resize-handle:hover::after {
			opacity: 1;
		}

		/* ── Loading / Empty States ───────────────────────────────────────── */
		.empty-state {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100%;
			color: var(--color-base-content-secondary, #656462);
			gap: calc(var(--spacing, 0.25rem) * 3);
		}

		/* ── Editor Skeleton ──────────────────────────────────────────────── */
		.editor-skeleton {
			display: flex;
			flex-direction: column;
			height: 100%;
			background: var(--color-base-100, #fff);
			border-radius: var(--radius-xl, 0.75rem);
			overflow: hidden;
		}
		.skel-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: calc(var(--spacing, 0.25rem) * 3) calc(var(--spacing, 0.25rem) * 4);
			border-bottom: 1px solid var(--color-base-300, #e5e5e5);
		}
		.skel-tabs {
			display: flex;
			gap: calc(var(--spacing, 0.25rem) * 2);
		}
		.skel-tab {
			width: 72px;
			height: 28px;
			border-radius: var(--radius-lg, 0.5rem);
		}
		.skel-actions {
			display: flex;
			gap: calc(var(--spacing, 0.25rem) * 2);
		}
		.skel-circle {
			width: 28px;
			height: 28px;
			border-radius: var(--radius-full, 9999px);
		}
		.skel-body {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 3);
			padding: calc(var(--spacing, 0.25rem) * 6);
		}
		.skel-line {
			height: 14px;
			border-radius: var(--radius-md, 0.375rem);
		}
		.skel-line--wide  { width: 90%; }
		.skel-line--med   { width: 65%; }
		.skel-line--short { width: 40%; }
		.skel-shimmer {
			background: linear-gradient(90deg, var(--color-base-200, #f0f0f0) 25%, var(--color-base-300, #e5e5e5) 50%, var(--color-base-200, #f0f0f0) 75%);
			background-size: 200% 100%;
			animation: shimmer 1.5s ease-in-out infinite;
		}
		@keyframes shimmer {
			0%   { background-position: 200% 0; }
			100% { background-position: -200% 0; }
		}

		/* ── Panel Slide Animations ───────────────────────────────────────── */
		.panel-slide-left {
			animation: slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
		}

		.panel-slide-right {
			animation: slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
		}

		.panel-fade-in {
			animation: fadeIn 0.3s ease both;
		}

		@keyframes slideInLeft {
			from {
				transform: translateX(-100%);
				opacity: 0;
			}
			to {
				transform: translateX(0);
				opacity: 1;
			}
		}

		@keyframes slideInRight {
			from {
				transform: translateX(100%);
				opacity: 0;
			}
			to {
				transform: translateX(0);
				opacity: 1;
			}
		}

		@keyframes fadeIn {
			from { opacity: 0; }
			to { opacity: 1; }
		}

		/* ── Panel Toggle Buttons ─────────────────────────────────────────── */
		wb-ds-icon-button {
			flex-shrink: 0;
			align-self: center;
		}

		/* ── Accessibility ────────────────────────────────────────────────── */
		@media (prefers-reduced-motion: reduce) {
			.skel-shimmer {
				animation: none;
				opacity: 0.6;
			}
			.resize-handle,
			.resize-handle::after {
				transition: none;
			}
			.panel-slide-left,
			.panel-slide-right,
			.panel-fade-in {
				animation: none;
			}
		}
	`;
}
