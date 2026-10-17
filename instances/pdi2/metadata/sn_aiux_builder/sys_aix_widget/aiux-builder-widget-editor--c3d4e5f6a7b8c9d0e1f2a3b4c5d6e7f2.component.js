import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { locationService, themeService, i18n } from '@servicenow/aiux-services';
import { snHttp } from '@servicenow/aiux-utils';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-ds-code-editor';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-entity-service';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-responsive-preview';
/**
 * AIX Widget Editor
 *
 * Widget editor with Preview (responsive-preview), Component (CodeMirror),
 * and Script (CodeMirror) tabs. Collapsible Input/Output side panel with
 * real script runner (POST /sys.scripts.do). Save persists via entity service.
 *
 * @property {String} widgetName - Widget name shown in breadcrumb
 * @property {String} viewport - Viewport label shown in breadcrumb
 *
 * @fires wb-editor-save - When save completes (detail: { widgetId, success, error? })
 * @fires wb-wb-editor-panel-toggle - When side panel opens/closes (detail: { open, mode })
 * @fires wb-editor-state-change - When editor state changes
 */
class AiuxBuilderWidgetEditorTabs extends AIUXWidgetElement {
	static dependencies = ['AIUX_CodeMirror_6'];

	static properties = {
		/** Active top header tab: 'preview' | 'component' | 'script' (public, settable from outside) */
		activeTab:        { type: String, attribute: 'active-tab' },
		/** Internal active tab state */
		_activeTab:       { type: String,  state: true },
		/** Whether the right side panel is visible */
		_panelOpen:       { type: Boolean, state: true },
		/** Which panel is shown: 'settings' | 'preview-props' | 'script-runner' */
		_panelMode:       { type: String,  state: true },
		/** JSON content of Options textarea */
		_optionsJson:     { type: String,  state: true },
		/** JSON content of Input textarea */
		_inputJson:       { type: String,  state: true },
		/** Output text after Run */
		_output:          { type: String,  state: true },
		/** Script run status: '' | 'success' | 'error' */
		_outputStatus:    { type: String,  state: true },
		/** Running state */
		_running:         { type: Boolean, state: true },
		/** Widget name shown in breadcrumb */
		widgetName:       { type: String },
		/** Widget ID from route */
		widgetId:         { type: String, attribute: 'widget-id' },
		/** Loaded widget data */
		_widget:          { type: Object, state: true },
		/** Last saved/loaded widget element name — reactive so preview only reloads on save */
		_originalWidgetId: { type: String, state: true },
		/** Loading state */
		_loading:         { type: Boolean, state: true },
		/** Error message */
		_error:           { type: String, state: true },
		/** Save in progress */
		_saving:          { type: Boolean, state: true },
		/** Whether user has saved at least once — enables undo/rollback */
		_hasSaved:        { type: Boolean, state: true },
		/** Dirty tracking — which tabs have unsaved changes */
		_dirtyTabs:       { type: Object, state: true },
		/** External dirty flag — set by parent when non-code properties changed */
		dirty:            { type: Boolean },
		/** Instance widgets for autocomplete */
		_instanceWidgets: { type: Array,  state: true },
		/** Preview input property values */
		_previewInputs:   { type: Object, state: true },
		/** Toast notifications */
		_toasts:          { type: Array,  state: true },
		/** Current theme */
		_theme:           { type: String, state: true },
		/** Choices data from parent (e.g. roles) */
		_choices:         { type: Object, state: true },
		/** Choices input property passed from parent */
		choices:          { type: Object },
		/** AI is generating code — disables editor and shows skeleton */
		_generating:      { type: Boolean, state: true },
		/** Whether the editor should be read-only (non-maint user + widget has a protection policy) */
		readOnly:         { type: Boolean, attribute: 'read-only' },
		/** Controls the unsaved-changes navigation guard dialog */
		_showNavGuard:    { type: Boolean, state: true },
		/** URL captured from blocked navigation, used when user confirms leave */
		_pendingNavUrl:   { type: String,  state: true },
		/** Show a back button to navigate to widget gallery (used when chat panel is hidden) */
		showBackButton:   { type: Boolean, attribute: 'show-back-button' },
		/** Whether NextWave (Premium Chat) is enabled in the instance */
		_isNextWaveEnabled: { type: Boolean, state: true },
		/** Platform scope is being fetched — show skeleton in breadcrumb */
		_scopeResolving: { type: Boolean, state: true },
	};

	constructor() {
		super();
		this._activeTab    = 'preview';
		this._panelOpen    = true;
		this._panelMode    = 'settings';
		this._optionsJson  = '{}';
		this._inputJson    = '{}';
		this._output       = '';
		this._outputStatus = '';
		this._running      = false;
		this.widgetName    = '';
		this.widgetId      = '';
		this._widget       = null;
		this._originalWidgetId = '';
		this._loading      = true;
		this._error        = '';
		this._saving          = false;
		this._hasSaved        = false;
		this._dirtyTabs       = {};
		this.dirty            = false;
		// Original values for dirty comparison
		this._originals       = {};
		this._instanceWidgets = [];
		this._previewInputs   = {};
		this._previewStale    = false;
		this._toasts          = [];
		this._theme           = '';
		this._choices         = {};
		this.choices          = {};
		this.readOnly         = false;
		this._showNavGuard  = false;
		this._pendingNavUrl = '';
		this._isNextWaveEnabled = false;
		this._scopeResolving = false;
	}

	// ── Toast Service ─────────────────────────────────────────────────────

	/**
	 * Show a toast notification.
	 * @param {string} message - Text to display
	 * @param {'info'|'success'|'warning'|'error'} [variant='info']
	 * @param {number} [duration=4000] - Auto-dismiss ms (0 = sticky)
	 */
	_showToast(message, variant = 'info', duration = 4000) {
		const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
		this._toasts = [...this._toasts, { id, message, variant, duration }];
		
	}

	_dismissToast(id) {
		this._toasts = this._toasts.filter(t => t.id !== id);
	}

	willUpdate(changed) {
		if (changed.has('activeTab') && this.activeTab) {
			this._activeTab = this.activeTab;
		}
	}

	// ── Lifecycle ─────────────────────────────────────────────────────────

	connectedCallback() {
		super.connectedCallback();

		// Extract widgetId from route: /edit/widget/:widgetId
		this._routeUnsubscribe = locationService.subscribe((route) => {
			const page = route?.page || '';
			const segments = page.split('/').filter(Boolean);
			if (segments[0] === 'edit' && segments[1] === 'widget' && segments[2]) {
				const routeWidgetId = segments[2];
				if (routeWidgetId !== this.widgetId) {
					this.widgetId = routeWidgetId;
					if (routeWidgetId === '-1') {
						this._loadDummyWidget();
					} else {
						this._loadWidget();
					}
				}
			}
		});

		if (this.widgetId) {
			if (this.widgetId === '-1') {
				this._loadDummyWidget();
			} else {
				this._loadWidget();
			}
		}

		// Navigation guard — block leaving with unsaved changes
		this._navGuardUnsubscribe = locationService.onBeforeNavigate((url) => {
			if (this._isDirty) {
				this._pendingNavUrl = url;
				this._showNavGuard = true;
				return false;
			}
		});
		this._handleBeforeUnload = (e) => {
			if (this._isDirty) {
				e.preventDefault();
				e.returnValue = '';
			}
		};
		window.addEventListener('beforeunload', this._handleBeforeUnload);
		this._handleKeyDown = this._handleKeyDown.bind(this);
		document.addEventListener('keydown', this._handleKeyDown);
	}

	onDataChange(newData, oldData) {
		if (newData && !oldData) {
			const oldEnabled = this._isNextWaveEnabled;
			this._isNextWaveEnabled = !!this.data?.isNextWaveEnabled;
			if (oldEnabled !== this._isNextWaveEnabled) {
				this._notifyStateChange();
			}
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		if (this._routeUnsubscribe) {
			this._routeUnsubscribe();
			this._routeUnsubscribe = null;
		}
		this._navGuardUnsubscribe?.();
		this._navGuardUnsubscribe = null;
		if (this._handleBeforeUnload) {
			window.removeEventListener('beforeunload', this._handleBeforeUnload);
			this._handleBeforeUnload = null;
		}
		if (this._handleKeyDown) {
			document.removeEventListener('keydown', this._handleKeyDown);
		}
	}

	// ── Data Loading ──────────────────────────────────────────────────────

	/** Load a dummy in-memory widget for the creation placeholder route (-1) */
	_loadDummyWidget() {
		const componentBoilerplate = `import { html, css } from \'lit\';
import { i18n } from \'@servicenow/aiux-services\';
import { AIUXWidgetElement } from \'@servicenow/aiux-components-core\';

class UntitledWidget extends AIUXWidgetElement {
    static properties = {
        headingTitle: { type: String, description: \'Title of the heading\' }
    }

    static styles = css\`
        :host {
            display: block;
            height: 100%;
        }

        .widget-heading {
            color: var(--color-secondary-content);
        }
    \`

    constructor() {
        super();
        this.headingTitle = i18n.getMessage(\'Hello User\');
    }

    render() {
        return html\`
            <div class="widget-container">
                <h2 class="widget-heading text-sm font-medium mb-6">
                    \${this.headingTitle}
                \t\t\t\t</h2>

            \t\t\t</div>
        \`;
    }
}
`;
		const scriptBoilerplate = `(function(data, options, input) {
    \/* Edit your server-side script here *\/
})(data, options, input);`;
		const cachedScope = window.AIUX_CURRENT_SCOPE;
		this._widget = {
			sys_id: '',
			id: 'untitled-widget',
			name: 'untitled widget',
			description: '',
			component: componentBoilerplate,
			script: scriptBoilerplate,
			category: 'custom',
			servicenow: 'false',
			sys_scope: cachedScope?.sysId || '',
			sys_scope_display: cachedScope?.name || '',
			input_schema: '',
			best_for: '',
			chat_compatible: 'false',
			interactive_view_compatible: 'false',
			roles: '',
		};
		this.widgetName = '';
		this._originalWidgetId = this._widget.id;
		this._originals = { component: componentBoilerplate, script: scriptBoilerplate };
		this._panelOpen = false;
		this._loading = false;
		if (!cachedScope) {
			this._scopeResolving = true;
			this._fetchPlatformScope();
		}
	}

	async _fetchPlatformScope() {
		try {
			const res = await snHttp.get('/api/now/ui/concoursepicker/application');
			const { current, list } = res.data?.result || {};
			if (!current) return;
			const match = (list || []).find(item => item.sysId === current);
			const scopeDetail = {
				sysId: current,
				name: match?.name || '',
				scopeName: match?.scopeName || '',
			};
			window.AIUX_CURRENT_SCOPE = scopeDetail;
			if (this.widgetId === '-1' && this._widget && !this._widget.sys_id) {
				this._widget = {
					...this._widget,
					sys_scope: scopeDetail.sysId,
					sys_scope_display: scopeDetail.name,
				};
			}
		} catch (err) {
			console.error('[WidgetEditor] Failed to fetch platform scope:', err);
		} finally {
			this._scopeResolving = false;
		}
	}

	async _loadWidget() {
		if (!this.widgetId) {
			this._loading = false;
			return;
		}

		this._loading = true;
		this._error = '';
		this._dirtyTabs = {};
		this._panelOpen = true;
		try {
			let retries = 0;
			while (!window.aiuxBuilderEntityService && retries < 30) {
				await new Promise(r => setTimeout(r, 100));
				retries++;
			}

			const service = window.aiuxBuilderEntityService;
			if (service) {
				const widget = await service.get('sys_aix_widget', this.widgetId);
				if (widget) {
					this._widget = {
						sys_id: widget.sys_id?.value || widget.sys_id,
						id: widget.id?.value || widget.id || '',
						name: widget.name?.value || widget.name || '',
						description: widget.description?.value || widget.description || '',
						component: widget.component?.value || widget.component || '',
						script: widget.script?.value || widget.script || '',
						category: widget.category?.value || widget.category || 'custom',
						servicenow: widget.servicenow?.value || widget.servicenow || 'false',
						sys_scope: widget.sys_scope?.value || widget.sys_scope || '',
						sys_scope_display: widget.sys_scope?.display_value || '',
						input_schema: widget.input_schema?.value || widget.input_schema || '',
						best_for: widget.best_for?.value || widget.best_for || '',
						chat_compatible: widget.chat_compatible?.value || widget.chat_compatible || 'false',
						interactive_view_compatible: widget.interactive_view_compatible?.value || widget.interactive_view_compatible || 'false',
						roles: widget.roles?.value || widget.roles || '',
					};
					this._previewInputs = {};
					this.widgetName = this._widget.name || this._widget.id || i18n.getMessage('Untitled');
					this._originalWidgetId = this._widget.id;
					this._originals = {
						component: this._widget.component,
						script: this._widget.script,
					};
					// Resolve scope display name if not available from widget API
					if (!this._widget.sys_scope_display && this._widget.sys_scope) {
						this._resolveScopeDisplayName(this._widget.sys_scope, service);
					}
				} else {
					this._widget = null;
					this._error = i18n.getMessage('Widget not found');
				}
			} else {
				console.warn('[WidgetEditor] Entity service not available');
				this._widget = null;
				this._error = i18n.getMessage('Entity service unavailable');
				this._showToast(i18n.getMessage('Entity service unavailable'), 'error');
			}
		} catch (err) {
			console.error('[WidgetEditor] Failed to load widget:', err);
			this._widget = null;
			this._error = i18n.getMessage('Failed to load widget: {0}', [err.message]);
			this._showToast(i18n.getMessage('Failed to load widget'), 'error');
		} finally {
			this._loading = false;
			this._notifyStateChange();
		}
		// Non-blocking: fetch instance widget list for autocomplete
		this._loadAllWidgets();
	}

	async _resolveScopeDisplayName(scopeSysId, service) {
		try {
			const scope = await service.get('sys_scope', scopeSysId);
			const name = scope?.name?.display_value || scope?.name?.value || scope?.name || '';
			if (name && this._widget) {
				this._widget = { ...this._widget, sys_scope_display: name };
				this.requestUpdate();
			}
		} catch {
			// Scope lookup failed — leave display as-is
		}
	}

	_loadAllWidgets() {
		if (this._instanceWidgets.length > 0) return;
		let service = window.aiuxBuilderEntityService;
		if (!service) return;
		service.list('sys_aix_widget', { fields: ['sys_id', 'name', 'id', 'input_schema', 'sys_scope', 'sys_scope.scope'], limit: 500 })
			.then(widgets => {
				this._instanceWidgets = (widgets || [])
					.filter(w => {
						const raw = w.id?.value != null ? w.id.value : (typeof w.id === 'string' ? w.id : '');
						const id = String(raw);
						const rawName = w.name?.display_value ?? w.name?.value ?? (typeof w.name === 'string' ? w.name : '');
						const name = String(rawName ?? '');
						return id && !id.startsWith('wb-') && !name.toLowerCase().startsWith('aiux');
					})
					.map(w => {
						const raw = w.id?.value != null ? w.id.value : (typeof w.id === 'string' ? w.id : '');
						const id = String(raw);
						const rawName = w.name?.display_value ?? w.name?.value ?? (typeof w.name === 'string' ? w.name : '');
						const name = String(rawName ?? '') || id;
						let props  = null;
						try { props = JSON.parse(w.input_schema?.value || w.input_schema || '{}'); } catch(e) { props = {}; }
						// Prefer dot-walked sys_scope.scope (the actual scope identifier, e.g. "sn_aiux_components")
						const scope = w['sys_scope.scope']?.value || w['sys_scope.scope'] || w.sys_scope?.value || (typeof w.sys_scope === 'string' ? w.sys_scope : '') || '';
						return { id, name, props, scope };
					});
			})
			.catch(err => console.warn('[WidgetEditor] Failed to load widget list for autocomplete:', err));
	}

	// ── Code Change Handler ───────────────────────────────────────────────

	_handleCodeChange(e) {
		if (!this._widget) return;
		const val = e.detail.value;
		const tab = this._activeTab; // 'component' or 'script'

		// Update widget data
		this._widget = { ...this._widget, [tab]: val };

		// Track dirty
		const orig = this._originals[tab] || '';
		this._dirtyTabs = { ...this._dirtyTabs, [tab]: val !== orig };

		// Mark preview as stale when component code changes while not on preview tab
		if (tab === 'component' && this._activeTab !== 'preview') {
			this._previewStale = true;
		}
	}

	// ── Navigation Guard ───────────────────────────────────────────────────

	_handleNavGuardStay() {
		this._showNavGuard = false;
		this._pendingNavUrl = '';
	}

	_handleNavGuardLeave() {
		this._showNavGuard = false;
		this._dirtyTabs = {};
		this.dirty = false;
		const pendingUrl = this._pendingNavUrl;
		this._pendingNavUrl = '';
		if (pendingUrl) {
			// onBeforeNavigate hands us a router-relative path (basePath stripped);
			// re-route through locationService so the router re-applies basePath.
			// Dirty state is cleared above, so the guard won't re-block.
			locationService.navigate(pendingUrl);
		}
	}

	// ── Keyboard Shortcuts ─────────────────────────────────────────────────

	_handleKeyDown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key === 's') {
			e.preventDefault();
			if (this._widget?.sys_id && !this._saving && !this.readOnly && this._isDirty) {
				this._handleSave();
			}
		}
	}

	get _isDirty() {
		return this.dirty || Object.values(this._dirtyTabs).some(Boolean);
	}

	// ── Save ──────────────────────────────────────────────────────────────

	async _handleSave() {
		if (!this._widget || this._saving) return;

		// Setting _saving = true before the tab switch means the preview element
		// will be stamped with suppress-auto-load, so firstUpdated() won't
		// auto-load the old widget while the save is in flight.
		this._saving = true;

		// Show centered loader in the preview immediately
		this._activeTab = 'preview';
		this._previewStale = false;
		await this.updateComplete;
		const preview = this.renderRoot?.querySelector('aiux-responsive-preview');
		if (preview) preview._loading = true;

		try {
			const service = window.aiuxBuilderEntityService;
			if (!service) {
				this._showToast(i18n.getMessage('Entity service unavailable'), 'error');
				return;
			}

			const newId = this._widget.id || '';

			// Basic client-side check — server BR is the authoritative validator
			if (!/^[a-z][a-z0-9_-]*-[a-z0-9_-]+$/.test(newId)) {
				this._showToast(i18n.getMessage('Custom element name must be lowercase and contain a hyphen (e.g. my-widget)'), 'error');
				return;
			}

			// Check for duplicate custom element name if it was changed,
			// or if this is a brand-new widget (no sys_id) where the default name may already exist.
			if (newId && (newId !== this._originalWidgetId || !this._widget.sys_id)) {
				const existing = await service.list('sys_aix_widget', {
					query: `id=${newId}^sys_id!=${this._widget.sys_id || '__new__'}`,
					fields: ['sys_id'],
					limit: 1,
					useCache: false,
				});
				if (existing?.length) {
					this._showToast(i18n.getMessage('A widget with custom element name "{0}" already exists', [newId]), 'error');
					return;
				}
			}

			const payload = {
				component: this._widget.component,
				script: this._widget.script,
				name: this._widget.name,
				id: newId,
				description: this._widget.description,
				category: 'custom',
				best_for: this._widget.best_for || '',
				chat_compatible: this._widget.chat_compatible || 'false',
				interactive_view_compatible: this._widget.interactive_view_compatible || 'false',
				roles: this._widget.roles || '',
			};
			const txScope = this._widget.sys_scope || '';

			// Use Table API directly — the widget API (/api/now/aix/widget) only handles
			// AI-specific fields (component/script) and doesn't persist widget properties.
			const params = new URLSearchParams({ sysparm_display_value: 'true' });
			if (txScope) params.set('sysparm_transaction_scope', txScope);

			// Create path: no sys_id means this is a brand-new widget (manual creation, no skill)
			if (!this._widget.sys_id) {
				const result = await snHttp.post(
					`/api/now/table/sys_aix_widget?${params}`,
					{ data: payload }
				);
				const newSysId = result?.data?.result?.sys_id?.value || result?.data?.result?.sys_id;
				if (!newSysId) throw new Error(i18n.getMessage('Create did not return a sys_id'));
				service._invalidateCache('list:sys_aix_widget');
				this._showToast(i18n.getMessage('Widget created'), 'success');
				// Clear dirty state before navigating so the nav guard doesn't fire
				this._dirtyTabs = {};
				this.dirty = false;
				this.dispatchEvent(new CustomEvent('wb-editor-save', {
					bubbles: true,
					composed: true,
					detail: { widgetId: newSysId, success: true, created: true },
				}));
				return;
			}

			await snHttp.put(
				`/api/now/table/sys_aix_widget/${this._widget.sys_id}?${params}`,
				{ data: payload }
			);
			// Invalidate entity service caches
			service._invalidateCache('list:sys_aix_widget');
			service._invalidateCache(`get:sys_aix_widget:${this._widget.sys_id}`);

			// Reset dirty tracking after successful save
			this._originals = {
				component: this._widget.component,
				script: this._widget.script,
			};
			this._dirtyTabs = {};
			this._originalWidgetId = newId;
			this.dirty = false;

			this._hasSaved = true;
			this._showToast(i18n.getMessage('Widget saved'), 'success');
			this.dispatchEvent(new CustomEvent('wb-editor-save', {
				bubbles: true,
				composed: true,
				detail: { widgetId: this._widget.sys_id, success: true },
			}));

			// Clear centered loader first (so preview-host is back in DOM),
			// _saving is still true here so suppress-auto-load is still active;
			// we clear _loading first so preview-host is back in the DOM for refresh.
			const savedPreview = this.renderRoot?.querySelector('aiux-responsive-preview');
			if (savedPreview) savedPreview._loading = false;
			if (savedPreview?.refresh) savedPreview.refresh();
		} catch (err) {
			console.error('[WidgetEditor] Save failed:', err);
			this._showToast(i18n.getMessage('Save failed: {0}', [err.message || err]), 'error');
			const errPreview = this.renderRoot?.querySelector('aiux-responsive-preview');
			if (errPreview) errPreview._loading = false;
			this.dispatchEvent(new CustomEvent('wb-editor-save', {
				bubbles: true,
				composed: true,
				detail: { widgetId: this._widget?.sys_id, success: false, error: err.message },
			}));
		} finally {
			this._saving = false;
			// suppress-auto-load is now false — if refresh() is still in flight
			// it proceeds normally; future tab switches auto-load as usual.
		}
	}

	// ── Script Runner ─────────────────────────────────────────────────────

	/**
	 * Build a harness that wraps the widget script with data/options/input
	 * variables and prints data as JSON — matching widget runtime behavior.
	 */
	_buildWidgetHarness(script) {
		let optionsVal = '{}';
		let inputVal = '{}';
		try { optionsVal = JSON.stringify(JSON.parse(this._optionsJson)); } catch(e) { /* use default */ }
		try { inputVal = JSON.stringify(JSON.parse(this._inputJson)); } catch(e) { /* use default */ }

		return [
			'var data = {};',
			'var options = ' + optionsVal + ';',
			'var input = ' + inputVal + ';',
			'',
			'// ── widget script ──',
			script,
			'',
			'// ── output ──',
			'gs.print(JSON.stringify(data, null, 2));',
		].join('\n');
	}

	_parseScriptResponse(raw) {
		const timingMatch = raw.match(/^\[([^\]]+)\]/);
		const timing = timingMatch ? '\u23F1 ' + timingMatch[1] : '';

		const preMatch = raw.match(/<PRE>([\s\S]*?)<\/PRE>/i);
		if (!preMatch?.[1]) {
			return [timing, i18n.getMessage('(no output — set data.xyz in your script to see output)')].filter(Boolean).join('\n');
		}

		const lines = preMatch[1]
			.replace(/<BR\s*\/?>/gi, '\n')
			.replace(/<[^>]+>/g, '')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.split('\n')
			.map(l => l.replace(/^\*\*\* Script:\s?/, ''))
			.filter(l => l.trim() !== '');

		return [timing, ...lines].filter(Boolean).join('\n');
	}

	async _handleRun() {
		if (this._running || !this._widget?.script) return;

		this._running = true;
		this._output = i18n.getMessage('Running script...');
		this._outputStatus = '';
		this._notifyStateChange();

		try {
			const finalScript = this._buildWidgetHarness(this._widget.script);

			const csrfToken = window.g_ck || '';
			const parts = [
				['sysparm_ck', csrfToken],
				['doc', ''],
				['for', ''],
				['vargror', ''],
				['info', ''],
				['method', ''],
				['vargr', ''],
				['go_to_input_', ''],
				['script', finalScript],
				['sys_original.script', ''],
				['sys_scope', 'global'],
				['record_for_rollback', 'on'],
				['quota_managed_transaction', 'on'],
				['runscript', ''],
				['script', ''],
				['script', finalScript],
			];
			const formBody = parts
				.map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
				.join('&');

			const resp = await snHttp.post('/sys.scripts.do', {
				data: formBody,
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				responseType: 'text',
			});

			const text = resp.data;

			if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
				this._output = i18n.getMessage('Script did not execute — received HTML instead of plain text.\nCheck that your session is still valid.');
				this._outputStatus = 'error';
				this._showToast(i18n.getMessage('Session expired — please refresh'), 'warning');
				return;
			}

			this._output = this._parseScriptResponse(text);
			this._outputStatus = 'success';
			this._showToast(i18n.getMessage('Script executed'), 'success', 2500);
		} catch (err) {
			this._output = i18n.getMessage('Error: {0}', [err.message || err]);
			this._outputStatus = 'error';
			this._showToast(i18n.getMessage('Script error: {0}', [err.message || err]), 'error');
		} finally {
			this._running = false;
			this._notifyStateChange();
		}
	}

	/** Notify parent that editor state relevant to the right panel has changed */
	_notifyStateChange() {
		this.dispatchEvent(new CustomEvent('wb-editor-state-change', {
			bubbles: true,
			composed: true,
		}));
	}

	// ── Preview Properties ────────────────────────────────────────────────

	/**
	 * Convert camelCase key to a human-readable label.
	 * e.g. "profileData" → "Profile Data", "isLoading" → "Is Loading"
	 */
	static _humanize(key) {
		return key
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
			.replace(/^./, c => c.toUpperCase());
	}

	/**
	 * Map input_schema type strings to Property Panel field descriptors.
	 *
	 * Supported input_schema types:
	 *   String, Number, Integer, Boolean,
	 *   Object, Array, JSON (complex — edited as JSON textarea)
	 */
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
		array:   { type: 'textarea', placeholder: '[]', rows: 4 },
		JSON:    { type: 'textarea', placeholder: '{}',  rows: 4 },
		json:    { type: 'textarea', placeholder: '{}',  rows: 4 },
	};

	/** These input_schema types represent complex values edited as JSON strings */
	static COMPLEX_TYPES = new Set([
		'Object', 'object', 'Array', 'array', 'JSON', 'json',
	]);

	/** Parse the widget's input_schema into Property Panel schema format */
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
				const defaults = AiuxBuilderWidgetEditorTabs.INPUT_SCHEMA_TYPE_MAP[typeName]
					|| { type: 'textarea', placeholder: '', rows: 3 };

				const field = {
					key,
					label: AiuxBuilderWidgetEditorTabs._humanize(key),
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

	_handlePreviewPropertyChange(e) {
		const { values } = e.detail;
		this._previewInputs = { ...values };
	}

	/**
	 * Coerce a form value back to its expected runtime type before
	 * setting it on the preview widget element.
	 */
	_coerceValue(key, formValue) {
		const raw = this._widget?.input_schema || '';
		try {
			const schema = JSON.parse(raw);
			const def = schema?.[key];
			const typeName = typeof def === 'string' ? def : (def?.type || 'String');

			if (AiuxBuilderWidgetEditorTabs.COMPLEX_TYPES.has(typeName)) {
				// Textarea holds a JSON string — parse it back to an object/array
				if (typeof formValue === 'string' && formValue.trim()) {
					try { return JSON.parse(formValue); } catch (_) { return formValue; }
				}
				return typeName.toLowerCase() === 'array' ? [] : {};
			}
			if (typeName === 'Number' || typeName === 'number' || typeName === 'Integer' || typeName === 'integer') {
				return Number(formValue) || 0;
			}
			if (typeName === 'Boolean' || typeName === 'boolean') {
				return !!formValue;
			}
			return formValue;
		} catch (_) {
			return formValue;
		}
	}

	async _applyPreviewInputs() {
		const preview = this.renderRoot?.querySelector('aiux-responsive-preview');
		if (!preview) return;

		// Coerce all values before passing — skip null/undefined so the widget's
		// own defaults are not overridden (e.g. avoids {} being set for an empty Object field)
		const coerced = {};
		Object.entries(this._previewInputs).forEach(([key, val]) => {
			if (val === null || val === undefined) return;
			const coercedVal = this._coerceValue(key, val);
			if (typeof coercedVal === 'object' && coercedVal !== null && Object.keys(coercedVal).length === 0) return;
			coerced[key] = coercedVal;
		});

		// Store props to apply after refresh, then reload widget
		preview._pendingProps = coerced;
		preview.refresh();
		this._showToast(i18n.getMessage('Preview refreshed with inputs'), 'success', 2500);
	}

	// ── Handlers ──────────────────────────────────────────────────────────

	_setActiveTab(tab) {
		const prevTab = this._activeTab;
		if (tab !== prevTab) {
			this._tabKey = (this._tabKey || 0) + 1;
		}
		this._activeTab = tab;

		// Only refresh preview when switching to it AND the code actually changed
		if (tab === 'preview' && prevTab !== 'preview' && this._previewStale) {
			this._previewStale = false;
			// Wait for Lit to render the preview element into the DOM
			this.updateComplete.then(() => {
				const preview = this.renderRoot?.querySelector('aiux-responsive-preview');
				if (preview?.refreshFromSource && this._widget?.component) {
					preview.refreshFromSource(this._widget.component);
				} else if (preview?.refresh) {
					preview.refresh();
				}
			});
		}

		if (tab === 'script') {
			// Auto-open script runner
			this._panelMode = 'script-runner';
			this._panelOpen = true;
			this._dispatchPanelState();
		} else if (this._panelMode === 'script-runner') {
			// Leaving script tab — always close script runner
			this._panelOpen = false;
			this._dispatchPanelState();
		}
	}

	_dispatchPanelState() {
		this.dispatchEvent(new CustomEvent('wb-editor-panel-toggle', {
			bubbles: true,
			composed: true,
			detail: { open: this._panelOpen, mode: this._panelMode },
		}));
	}

	_togglePanel() {
		this._panelOpen = !this._panelOpen;
		this.dispatchEvent(new CustomEvent('wb-editor-panel-toggle', {
			bubbles: true,
			composed: true,
			detail: {
				open: this._panelOpen,
				mode: this._panelMode,
			},
		}));
	}

	_handlePanelAction(e) {
		switch (e.detail.action) {
			case 'apply': this._applyPreviewInputs(); break;
			case 'run':   this._handleRun(); break;
		}
	}

	_handleScriptInputChange(e) {
		if (e.detail.field === 'options') this._optionsJson = e.detail.value;
		if (e.detail.field === 'input')   this._inputJson = e.detail.value;
		this._notifyStateChange();
	}

	async _handleUndo() {
		if (!this._widget?.sys_id || !this._hasSaved) return;
		this.trackEvent('Undo Widget', { widgetTag: this._widget?.name || '' });

		this._saving = true;
		try {
			const service = window.aiuxBuilderEntityService;
			if (!service?.revertWidget) {
				this._showToast(i18n.getMessage('Entity service not available'), 'error');
				return;
			}

			const revertResult = await service.revertWidget(this._widget.sys_id);
			const isSuccess = revertResult === true || revertResult?.success || revertResult?.result === true;

			if (isSuccess) {
				// Reload widget data from DB
				await this._loadWidget();
				this._hasSaved = false;
				this._showToast(i18n.getMessage('Changes reverted'), 'success');

				// Refresh preview
				const preview = this.renderRoot?.querySelector('aiux-responsive-preview');
				if (preview?.refresh) preview.refresh();
			} else {
				this._showToast(i18n.getMessage('Revert failed'), 'error');
			}
		} catch (err) {
			console.error('[WidgetEditor] Revert failed:', err);
			this._showToast(i18n.getMessage('Revert failed: {0}', [err.message || err]), 'error');
		} finally {
			this._saving = false;
		}
	}

	_handleRedo() {
		const editor = this.renderRoot?.querySelector('aiux-ds-code-editor');
		const view = editor?.getEditorView?.();
		const cm6 = this.deps.services.AIUX_CodeMirror_6;
		if (view && cm6) {
			const { redo } = cm6;
			if (redo) redo(view);
		}
	}

	_handleRefresh() {
		if (this._activeTab === 'preview') {
			const preview = this.renderRoot?.querySelector('aiux-responsive-preview');
			if (preview?.refreshFromSource && this._widget?.component) {
				preview.refreshFromSource(this._widget.component);
			} else if (preview?.refresh) {
				preview.refresh();
			}
		} else {
			this._loadWidget();
		}
	}

	/**
	 * Handle preview error events from the responsive-preview component.
	 * Shows a toast to inform the widget owner about the issue.
	 */
	_onPreviewError(e) {
		const { widgetId, error } = e.detail || {};
		let toastMsg = i18n.getMessage('Preview failed for "{0}"', [widgetId || this._widget?.id || 'unknown']);

		// Add a short hint based on error type
		if (error?.includes('Missing dependency') || error?.includes('is not defined')) {
			toastMsg += ' — ' + i18n.getMessage('a required dependency is missing. Check your component imports.');
		} else if (error?.includes('define timeout')) {
			toastMsg += ' — ' + i18n.getMessage('the widget timed out during registration. Check for syntax errors or missing dependencies.');
		} else if (error?.includes('Failed to import') || error?.includes('Failed to fetch')) {
			toastMsg += ' — ' + i18n.getMessage('could not load the widget bundle. Try saving the widget first.');
		} else if (error?.includes('registration failed')) {
			toastMsg += ' — ' + i18n.getMessage('element registration threw an error. Check the component code.');
		}

		this._showToast(toastMsg, 'error', 8000);
	}

	_handleBack() {
		const target = '/widgets';
		if (this._isDirty) {
			this._pendingNavUrl = target;
			this._showNavGuard = true;
			return;
		}
		locationService.navigate(target);
	}

	_handleSettings() {
		this._dispatchPanelToggle('settings');
	}

	_handlePreviewOptions() {
		this._dispatchPanelToggle('preview-props');
	}

	_handleScriptRunner() {
		this._dispatchPanelToggle('script-runner');
	}

	_dispatchPanelToggle(mode) {
		// Toggle: if already open at this mode, close; else open with this mode
		if (this._panelOpen && this._panelMode === mode) {
			this._panelOpen = false;
		} else {
			this._panelMode = mode;
			this._panelOpen = true;
		}
		this._dispatchPanelState();
	}

	// ── Icons (via aiux-icon) ─────────────────────────────────────────────

	_iconEye() {
		return html`<aiux-icon name="eye-outline" size="sm"></aiux-icon>`;
	}

	_iconCode() {
		return html`<aiux-icon name="code-outline" size="sm"></aiux-icon>`;
	}

	_iconScript() {
		return html`<aiux-icon name="script-outline" size="sm"></aiux-icon>`;
	}


	// ── Sub-renders ───────────────────────────────────────────────────────

	/** Build tabs array with dirty badges */
	get _editorTabs() {
		return [
			{
				id: 'preview',
				label: i18n.getMessage('Preview'),
				icon: this._iconEye(),
				badge: this._dirtyTabs.preview ? '!' : null,
			},
			{
				id: 'component',
				label: i18n.getMessage('Component'),
				icon: this._iconCode(),
				badge: this._dirtyTabs.component ? '!' : null,
			},
			{
				id: 'script',
				label: i18n.getMessage('Server Script'),
				icon: this._iconScript(),
				badge: this._dirtyTabs.script ? '!' : null,
			},
		];
	}

	_handleTabChange(tabId) {
		this._setActiveTab(tabId);
	}

	/** True when the editor is in creation placeholder mode */
	get _isPlaceholder() {
		return this.widgetId === '-1';
	}

	_renderHeader() {
		// When parent passes read-only=false (no skills, manual creation allowed), don't disable toolbar
		const disabled = (this._isPlaceholder && this.readOnly) || this._generating;
		const tablist = html`
			<div role="tablist" class="aiux-tabs aiux-tabs-box aiux-tabs-sm">
				${this._editorTabs.map(tab => html`
				<button
					role="tab"
					class="aiux-tab ${tab.id === this._activeTab ? 'aiux-tab-active' : ''} ${(disabled || this._saving || this._generating) ? 'aiux-btn-disabled' : ''}"
					@click=${() => this._handleTabChange(tab.id)}
				>
					${tab.icon} ${tab.label}
					${tab.badge ? html`<span class="aiux-badge aiux-badge-xs aiux-badge-warning">${tab.badge}</span>` : nothing}
				</button>
			`)}
			</div>
		`;
		const actionButtons = html`
			<div class="flex items-center gap-2">
				<button class="aiux-btn aiux-btn-ghost aiux-btn-md aiux-btn-circle aiux-tooltip aiux-tooltip-bottom ${(disabled || !this._hasSaved || this._saving) ? 'aiux-btn-disabled' : ''}" data-tip="${i18n.getMessage('Undo')}" @click=${this._handleUndo}><aiux-icon name="undo-outline" size="md"></aiux-icon></button>
				<div class="editor-divider"></div>
				<button class="aiux-btn aiux-btn-ghost aiux-btn-md aiux-btn-circle aiux-tooltip aiux-tooltip-bottom ${disabled ? 'aiux-btn-disabled' : ''}" data-tip="${i18n.getMessage('Refresh preview')}" @click=${this._handleRefresh}><aiux-icon name="arrow-clockwise-outline" size="md"></aiux-icon></button>
				${this._activeTab === 'preview' ? html`
					<button class="aiux-btn aiux-btn-ghost aiux-btn-md aiux-btn-circle aiux-tooltip aiux-tooltip-bottom ${disabled ? 'aiux-btn-disabled' : ''} ${this._panelOpen && this._panelMode === 'preview-props' ? 'btn-icon-active' : ''}" data-tip="${i18n.getMessage('Preview inputs')}" @click=${this._handlePreviewOptions}><aiux-icon name="sliders-outline" size="md"></aiux-icon></button>
				` : nothing}
				<button class="aiux-btn aiux-btn-ghost aiux-btn-md aiux-btn-circle aiux-tooltip aiux-tooltip-bottom ${disabled ? 'aiux-btn-disabled' : ''} ${this._panelOpen && this._panelMode === 'settings' ? 'btn-icon-active' : ''}" data-tip="${i18n.getMessage('Widget settings')}" @click=${this._handleSettings}><aiux-icon name="gear-outline" size="md"></aiux-icon></button>
				<button class="aiux-btn aiux-btn-neutral aiux-btn-md ${(disabled || this._saving || this._generating || !this._widget || !this._isDirty || this.readOnly) ? 'aiux-btn-disabled' : ''}" @click=${this._handleSave}>${this._saving ? i18n.getMessage('Saving…') : i18n.getMessage('Save')}</button>
			</div>
		`;
		return html`
			<header class="flex items-center justify-between px-4 editor-header ${this.showBackButton ? 'editor-header--no-chat' : ''}">
				${this.showBackButton ? html`
					<!-- Left: back + widget name -->
					<div class="flex items-center gap-2 editor-header-left">
						<button class="aiux-btn aiux-btn-ghost aiux-btn-md aiux-btn-circle aiux-tooltip aiux-tooltip-right" data-tip="${i18n.getMessage('Back to widgets')}" @click=${this._handleBack}><aiux-icon name="arrow-left" size="md"></aiux-icon></button>
						<span class="editor-widget-name">${this.widgetName || (this._isPlaceholder ? i18n.getMessage('untitled widget') : i18n.getMessage('Loading…'))}</span>
					</div>
					<!-- Center: tabs -->
					<div class="editor-header-center">${tablist}</div>
					<!-- Right: actions -->
					<div class="editor-header-right">${actionButtons}</div>
				` : html`
					<!-- Left: tabs (original layout) -->
					${tablist}
					<!-- Right: actions -->
					${actionButtons}
				`}
			</header>
		`;
	}

	_renderBreadcrumb() {
		return html`
			<div class="flex items-center justify-between px-4 breadcrumb-bar">
				<div class="flex items-center gap-2">
					<span class="aiux-badge aiux-badge-ghost aiux-badge-sm gap-1">
						<aiux-icon name="globe-outline" size="xs"></aiux-icon>
						${this._scopeResolving
							? html`<span class="scope-skel-bar" aria-label="${i18n.getMessage('Loading scope')}"></span>`
							: i18n.getMessage('Scope: {0}', [this._widget?.sys_scope_display || 'global'])}
					</span>
					${this.readOnly ? html`
						<span class="aiux-badge aiux-badge-warning aiux-badge-sm gap-1">
							<aiux-icon name="lock-outline" size="xs"></aiux-icon>
							${i18n.getMessage('Read only')}
							<button
							class="aiux-tooltip aiux-tooltip-top"
							data-tip="${i18n.getMessage('You don\'t have permission to edit this widget')}"
							aria-label="${i18n.getMessage('Read only info')}"
						>
							<aiux-icon name="circle-info-outline" size="xs"></aiux-icon>
						</button>
						</span>
					` : nothing}
				</div>
				<span class="breadcrumb-label">${this._isPlaceholder ? nothing : (this.widgetName || i18n.getMessage('Loading…'))}</span>
			</div>
		`;
	}

	_renderNavGuard() {
		return html`
			<aiux-dialog
				?open=${this._showNavGuard}
				size="sm"
				show-close-button
				close-on-escape
				dialog-label="${i18n.getMessage('Unsaved changes')}"
				@aix-dialog-close=${this._handleNavGuardStay}
			>
				<div slot="header">
					<div class="nav-guard-title">${i18n.getMessage('Unsaved changes')}</div>
				</div>
				<p class="nav-guard-body">
					${i18n.getMessage('You have unsaved changes. If you leave, your changes will be lost.')}
				</p>
				<div slot="footer" class="nav-guard-footer">
					<button class="aiux-btn aiux-btn-ghost" @click=${this._handleNavGuardStay}>
						${i18n.getMessage('Stay')}
					</button>
					<button class="aiux-btn aiux-btn-error" @click=${this._handleNavGuardLeave}>
						${i18n.getMessage('Discard & Leave')}
					</button>
				</div>
			</aiux-dialog>
		`;
	}

	_renderPreviewSkeleton() {
		return html`
			<div class="preview-skel-wrapper">
				<div class="preview-skel-container">
					<div class="preview-skel-layout">
						<!-- Left handle -->
						<div class="preview-skel-handle-h"><div class="preview-skel-grip"></div></div>

						<!-- Viewport frame -->
						<div class="preview-skel-frame">
							<div class="preview-skel-content">
								<div class="preview-skel-row">
									<div class="preview-skel-circle"></div>
									<div class="preview-skel-lines">
										<div class="preview-skel-bar" style="width:60%"></div>
										<div class="preview-skel-bar" style="width:40%"></div>
									</div>
								</div>
								<div class="preview-skel-block"></div>
								<div class="preview-skel-bar" style="width:80%"></div>
								<div class="preview-skel-bar" style="width:50%"></div>
								<div class="preview-skel-row" style="gap:8px;margin-top:8px;">
									<div class="preview-skel-btn"></div>
									<div class="preview-skel-btn preview-skel-btn--sm"></div>
								</div>
							</div>

							<!-- Bottom handle -->
							<div class="preview-skel-handle-v"><div class="preview-skel-grip-h"></div></div>
							<!-- Corner handle -->
							<div class="preview-skel-handle-corner"><div class="preview-skel-grip-corner"></div></div>
						</div>

						<!-- Right handle -->
						<div class="preview-skel-handle-h"><div class="preview-skel-grip"></div></div>
					</div>
				</div>
			</div>
		`;
	}

	_renderCanvasContent() {
		if (this._loading || this._saving || this._generating) {
			return this._renderPreviewSkeleton();
		}

		if (this._error) {
			return html`
				<div class="flex items-center justify-center w-full h-full">
					<div class="text-center error-container">
						<aiux-icon name="circle-exclamation-outline" size="lg" class="mx-auto mb-3 opacity-40"></aiux-icon>
						<p class="error-message">${this._error}</p>
						<button class="aiux-btn aiux-btn-ghost aiux-btn-sm" @click=${this._loadWidget}>${i18n.getMessage('Retry')}</button>
					</div>
				</div>
			`;
		}

		if (this._activeTab === 'component') {
			return html`
				<aiux-ds-code-editor
					.value=${this._widget?.component || ''}
					.instanceWidgets=${this._instanceWidgets}
					language="javascript"
					script-mode="component"
					line-numbers
					tab-size="4"
					placeholder="${i18n.getMessage('// Component code...')}"
					?read-only=${this.readOnly}
					@ds-change=${this._handleCodeChange}
					></aiux-ds-code-editor>
			`;
		}

		// Script tab
		return html`
			<aiux-ds-code-editor
				.value=${this._widget?.script || ''}
				.instanceWidgets=${this._instanceWidgets}
				language="javascript"
				script-mode="server"
				line-numbers
				tab-size="4"
				placeholder="${i18n.getMessage('// Server-side script...')}"
				?read-only=${this.readOnly}
				@ds-change=${this._handleCodeChange}
				class="code-editor-full"
			></aiux-ds-code-editor>
		`;
	}

	get _settingsSchema() {
		const chatFields = this._isNextWaveEnabled ? [
			{ key: 'chat_compatible', label: i18n.getMessage('Chat compatible'), type: 'toggle', defaultValue: false,
				tooltip: i18n.getMessage('Allow mapping this widget to outputs of AI agents in the Otto Premium chat experience') },
			...(this._isChatCompatible ? [
				{ key: 'interactive_view_compatible', label: i18n.getMessage('Interactive view compatible'), type: 'toggle', defaultValue: false,
					tooltip: i18n.getMessage('The widget opens in the Interactive view vs inline when rendered in chat. Use for widgets that require more real estate') },
			] : []),
		] : [];
		
		return [
			{ key: 'id', label: i18n.getMessage('Custom element name'), type: 'text', required: true,
				pattern: '^[a-z][a-z0-9\\-_]*-[a-z0-9\\-_]*$',
				patternError: i18n.getMessage('Lowercase letters, numbers, hyphens and underscores — must contain a hyphen (e.g. my-widget)'),
				tooltip: i18n.getMessage('The web component tag to use this widget. Must be unique across the instance') },
			{ key: 'name', label: i18n.getMessage('Widget name'), type: 'text', required: true,
				tooltip: i18n.getMessage('How this widget appears to you and other builders in the library, search, and admin views.') },
			{ key: 'description', label: i18n.getMessage('Description'), type: 'textarea', rows: 3, placeholder: i18n.getMessage('Describe what the widget is for') },
			{ key: 'best_for', label: i18n.getMessage('Suggested use case'), type: 'textarea', rows: 2, placeholder: i18n.getMessage('For example, use on the home page for managers tracking team workload') },
			...chatFields,
			{ key: 'roles', label: i18n.getMessage('Roles'), type: 'pillselect',
				tooltip: i18n.getMessage('Restrict which user roles can see this widget. Leave empty to make it available to everyone.'),
				placeholder: i18n.getMessage('Search roles...'), options: this.choices?.roles || [], defaultValue: [] },
		];
	}

	get _isChatCompatible() {
		const v = this._widget?.chat_compatible;
		return v === true || v === 'true' || v === '1';
	}

	get _settingsValues() {
		if (!this._widget) return {};
		const toBool = (v) => v === true || v === 'true' || v === '1';
		return {
			id: this._widget.id || '',
			name: this._widget.name || '',
			description: this._widget.description || '',
			best_for: this._widget.best_for || '',
				chat_compatible: toBool(this._widget.chat_compatible),
			interactive_view_compatible: toBool(this._widget.interactive_view_compatible),
			roles: this._widget.roles ? this._widget.roles.split(',').map(r => r.trim()).filter(Boolean) : [],
			component: this._widget.component || '',
			script: this._widget.script || '',
		};
	}

	_handleSettingsChange(e) {
		const { key, value } = e.detail;
		if (!this._widget) return;
		const storeValue = Array.isArray(value) ? value.join(',') : value;
		const updates = { [key]: storeValue };
		if (key === 'chat_compatible' && !value) {
			updates.interactive_view_compatible = 'false';
		}
		this._widget = { ...this._widget, ...updates };
		this.dirty = true;
	}


	// ── Root render ───────────────────────────────────────────────────────

	render() {
		return html`
			<div class="editor-root ${this._generating ? 'editor-root--generating' : ''}">
				${this._renderHeader()}

				<!-- Toast notifications — below header -->
				${this._toasts.map(t => html`
					<aiux-toast-notification
						type="${t.variant}"
						message="${t.message}"
						position="top-center"
						duration="999999999"
						dismissible
						visible
						@toast-dismiss=${() => this._dismissToast(t.id)}
					></aiux-toast-notification>
				`)}

				<!-- Navigation guard dialog -->
				${this._renderNavGuard()}

				<!-- Main body: canvas -->
				<div class="editor-body">
					<div class="editor-canvas">
						${this._activeTab === 'preview' ? html`
							<div class="preview-container" style="display:flex; height:100%;">
								${this._originalWidgetId ? html`
									<aiux-responsive-preview
										widget-id="${this._originalWidgetId}"
										?placeholder=${this.widgetId === '-1'}
										?suppress-auto-load=${this._saving}
										@wb-preview-error=${this._onPreviewError}
									></aiux-responsive-preview>
								` : nothing}
							</div>
						` : html`
							<div class="tab-content" key="${this._activeTab}-${this._tabKey || 0}">
								${this._renderCanvasContent()}
							</div>
						`}
					</div>
				</div>

				<!-- Bottom status bar — spans full width -->
				${this._renderBreadcrumb()}

			</div>
		`;
	}

	static styles = css`
		.btn-icon-active {
			background: var(--color-base-300, #cbd5e1) !important;
			color: var(--color-base-content, #1e293b) !important;
		}

		:host {
			display: block;
			width: 100%;
			height: 100%;
			overflow: hidden;
		}
		.editor-root--generating .editor-header {
			opacity: 0.5;
			pointer-events: none;
		}
		.nav-guard-title {
			font-weight: 600;
			font-size: 1rem;
		}
		.nav-guard-body {
			margin: 0;
			padding: 0 0 0.5rem 0;
			color: var(--color-base-content);
		}
		.nav-guard-footer {
			display: flex;
			justify-content: flex-end;
			gap: 0.5rem;
		}
		.editor-root {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 100%;
			max-height: 100%;
			background: var(--color-base-300, #e1e1e0);
			overflow: hidden;
		}
		.editor-body {
			display: flex;
			flex: 1;
			min-height: 0;
			overflow: hidden;
		}
		.editor-canvas {
			display: flex;
			flex-direction: column;
			flex: 1;
			min-height: 0;
			min-width: 0;
			overflow: hidden;
			background: var(--neutral-300);
		}
		.tab-content {
			display: flex;
			flex-direction: column;
			flex: 1;
			min-height: 0;
			animation: tabFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both;
		}
		@keyframes tabFadeIn {
			from {
				opacity: 0;
				transform: translateY(4px);
			}
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}
		/* ── Toolbar divider ─────────────────────────────────────────────── */
		.editor-divider {
			width: 1px;
			height: calc(var(--spacing, 0.25rem) * 4);
			background: var(--color-base-300, #d1d5db);
			margin: 0 calc(var(--spacing, 0.25rem) * 1);
			flex-shrink: 0;
		}

		/* ── Editor tab overrides ─────────────────────────────────────────── */
		.aiux-tabs {
			padding: calc(var(--spacing, 0.25rem) * 1);
			border-radius: var(--radius-2xl, 1rem);
			border: 1px solid var(--color-base-300, #CBD5E1);
			background: var(--neutral-50);
		}
		.aiux-tab {
			gap: calc(var(--spacing, 0.25rem) * 2);
			border-radius: var(--radius-xl, 0.75rem);
		}
		.aiux-tab[aria-selected="true"], .aiux-tab.active {
			background: var(--color-base-200, #DEE2E9);
		}
		.scope-pill {
			display: inline-flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1);
			padding: 1px calc(var(--spacing, 0.25rem) * 2);
			border-radius: var(--radius-full, 9999px);
			background: var(--color-base-200, #e2e8f0);
			color: var(--color-base-content-secondary, #4d4c4b);
			font-size: var(--text-xs, 0.75rem);
			font-weight: var(--font-weight-medium, 500);
		}
		.scope-skel-bar {
			display: inline-block;
			width: calc(var(--spacing, 0.25rem) * 28);
			height: calc(var(--spacing, 0.25rem) * 3);
			border-radius: var(--radius-md, 0.375rem);
			background: linear-gradient(90deg, #e8ecf0 25%, #f4f6f8 50%, #e8ecf0 75%);
			background-size: 200% 100%;
			animation: skelShimmer 1.5s ease infinite;
		}
		/* Ensure code editor fills its container */
		aiux-ds-code-editor {
			display: block;
			flex: 1;
			min-height: 0;
			width: 100%;
		}
		/* Center the preview within the canvas */
		.preview-container {
			display: flex;
			align-items: center;
			justify-content: center;
			flex: 1;
			min-height: 0;
			overflow: auto;
			padding: calc(var(--spacing, 0.25rem) * 4);
		}
		.preview-container aiux-responsive-preview {
			display: block;
			max-width: 100%;
			max-height: 100%;
		}
		/* ── Preview-panel skeleton loader ─────────────────────────────────── */
		@keyframes skelShimmer {
			0% { background-position: -200% 0; }
			100% { background-position: 200% 0; }
		}
		.preview-skel-wrapper {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			overflow: hidden;
			background: var(--color-base-300, #e1e1e0);
			padding: calc(var(--spacing, 0.25rem) * 6);
		}
		.preview-skel-container {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.preview-skel-layout {
			display: flex;
			align-items: stretch;
			position: relative;
		}
		.preview-skel-handle-h {
			width: calc(var(--spacing, 0.25rem) * 4);
			display: flex;
			align-items: center;
			justify-content: center;
			flex-shrink: 0;
		}
		.preview-skel-grip {
			width: calc(var(--spacing, 0.25rem) * 1);
			height: calc(var(--spacing, 0.25rem) * 8);
			border-radius: var(--radius-xs, 0.125rem);
			background: var(--color-base-content, #1f2937);
			opacity: 0.18;
		}
		.preview-skel-handle-v {
			height: calc(var(--spacing, 0.25rem) * 4);
			position: absolute;
			bottom: calc(var(--spacing, 0.25rem) * -4);
			left: calc(var(--spacing, 0.25rem) * 4);
			right: calc(var(--spacing, 0.25rem) * 4);
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.preview-skel-grip-h {
			width: calc(var(--spacing, 0.25rem) * 8);
			height: calc(var(--spacing, 0.25rem) * 1);
			border-radius: var(--radius-xs, 0.125rem);
			background: var(--color-base-content, #1f2937);
			opacity: 0.18;
		}
		.preview-skel-handle-corner {
			width: calc(var(--spacing, 0.25rem) * 4);
			height: calc(var(--spacing, 0.25rem) * 4);
			position: absolute;
			bottom: calc(var(--spacing, 0.25rem) * -4);
			right: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.preview-skel-grip-corner {
			width: calc(var(--spacing, 0.25rem) * 2);
			height: calc(var(--spacing, 0.25rem) * 2);
			border-inline-end: 2px solid var(--color-base-content, #1f2937);
			border-bottom: 2px solid var(--color-base-content, #1f2937);
			opacity: 0.18;
		}
		.preview-skel-frame {
			width: 480px;
			min-height: 380px;
			background: var(--color-base-100, #ffffff);
			border-radius: var(--radius-2xl, 1rem);
			box-shadow: 0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
			overflow: hidden;
			position: relative;
			flex-shrink: 0;
		}
		.preview-skel-content {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 4);
			padding: calc(var(--spacing, 0.25rem) * 6);
			height: 100%;
			box-sizing: border-box;
		}
		.preview-skel-row {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 3);
		}
		.preview-skel-circle {
			width: calc(var(--spacing, 0.25rem) * 10);
			height: calc(var(--spacing, 0.25rem) * 10);
			border-radius: var(--radius-full, 9999px);
			background: linear-gradient(90deg, #e8ecf0 25%, #f4f6f8 50%, #e8ecf0 75%);
			background-size: 200% 100%;
			animation: skelShimmer 1.5s ease infinite;
			flex-shrink: 0;
		}
		.preview-skel-lines {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 2);
			flex: 1;
		}
		.preview-skel-bar {
			height: calc(var(--spacing, 0.25rem) * 3);
			border-radius: var(--radius-md, 0.375rem);
			background: linear-gradient(90deg, #e8ecf0 25%, #f4f6f8 50%, #e8ecf0 75%);
			background-size: 200% 100%;
			animation: skelShimmer 1.5s ease infinite;
		}
		.preview-skel-block {
			width: 100%;
			flex: 1;
			min-height: calc(var(--spacing, 0.25rem) * 30);
			border-radius: var(--radius-xl, 0.75rem);
			background: linear-gradient(90deg, #e8ecf0 25%, #f4f6f8 50%, #e8ecf0 75%);
			background-size: 200% 100%;
			animation: skelShimmer 1.5s ease infinite;
		}
		.preview-skel-btn {
			width: calc(var(--spacing, 0.25rem) * 20);
			height: calc(var(--spacing, 0.25rem) * 8);
			border-radius: var(--radius-lg, 0.5rem);
			background: linear-gradient(90deg, #e8ecf0 25%, #f4f6f8 50%, #e8ecf0 75%);
			background-size: 200% 100%;
			animation: skelShimmer 1.5s ease infinite;
		}
		.preview-skel-btn--sm { width: calc(var(--spacing, 0.25rem) * 15); }

		.editor-header { height: calc(var(--spacing, 0.25rem) * 16); background: var(--color-base-100, #ffffff); border-bottom: 1px solid var(--color-base-200, #eeeeed); }
		.editor-header--no-chat { position: relative; justify-content: space-between; }
		.editor-header-left { flex-shrink: 0; }
		.editor-header-center { position: absolute; left: 50%; transform: translateX(-50%); }
		.editor-header-right { flex-shrink: 0; margin-left: auto; }
		.editor-widget-name { font-size: var(--text-sm, 0.875rem); font-weight: 600; color: var(--color-base-content, #1a1a1a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
		.btn-primary { margin-inline-start: calc(var(--spacing, 0.25rem) * 1); }
		.breadcrumb-bar { height: calc(var(--spacing, 0.25rem) * 7); background: var(--color-base-300, #eeeeed); }
		.breadcrumb-label { font-size: var(--text-xs, 0.75rem); color: var(--color-base-content-secondary, #4d4c4b); }
		.error-container { color: var(--color-base-content-secondary, #656462); }
		.error-message { font-size: var(--text-sm, 0.875rem); font-weight: var(--font-weight-medium, 500); color: var(--color-error, #c53030); }
		.code-editor-full { width: 100%; height: 100%; }


		@media (prefers-reduced-motion: reduce) {
			.tab-content { animation: none; }
			.preview-skel-circle, .preview-skel-bar, .preview-skel-block, .preview-skel-btn { animation: none; }
		}
		/* ── No-chat header layout (back button + centered tabs) ─────────────── */
		.editor-header--no-chat {
			position: relative;
			justify-content: space-between;
		}
		.editor-header-left {
			flex-shrink: 0;
		}
		.editor-header-center {
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
		}
		.editor-header-right {
			flex-shrink: 0;
			margin-left: auto;
		}
		.editor-widget-name {
			font-size: var(--text-sm, 0.875rem);
			font-weight: 600;
			color: var(--color-base-content, #1a1a1a);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 200px;
		}
	`;
}
