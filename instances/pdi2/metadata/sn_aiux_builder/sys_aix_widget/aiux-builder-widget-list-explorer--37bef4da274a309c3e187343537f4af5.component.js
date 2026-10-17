import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n, locationService } from '@servicenow/aiux-services';
import { snHttp } from '@servicenow/aiux-utils';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-widget-gallery';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-create-modal';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-entity-service';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-widget-list';

/**
 * AIUX Builder Widget List Page
 *
 * Composite page widget for the Widgets section that combines:
 * - App header with navigation
 * - Widget gallery with search, filter, sort
 * - Create widget modal integration
 *
 * Fetches widget data via entity service and handles CRUD operations.
 *
 * @fires widget-navigate - When navigating to widget editor (detail: { widgetId })
 */
class AiuxBuilderWidgetList extends AIUXWidgetElement {
    static properties = {
        /** Sub-heading shown below the page title */
        subtitle: { type: String, description: 'Sub-heading shown below the page title.' },
        /** Display mode passed down to child views */
        mode: { type: String, description: "Display mode. 'widget-builder' | 'dashboard-editor-list'" },
        /** Optional experience sys_id used to scope widget visibility. */
        experienceId: {
            type: String,
            attribute: 'experience-id',
            description: 'Optional experience sys_id to scope widget visibility.',
        },
        /** Internal: widgets data from entity service */
        _widgets: { type: Array, state: true },
        /** Internal: loading state */
        _loading: { type: Boolean, state: true },
        /** Internal: error message */
        _error: { type: String, state: true },
        /** Internal: show create modal */
        _showCreateModal: { type: Boolean, state: true },
        /** Internal: active view tab — 'grid' | 'list' */
        _activeView: { type: String, state: true },
        /** Internal: dashboard sys_id resolved from experienceId */
        _dashboardSysId: { type: String, state: true },
        /** Internal: clone source data for pre-populating create modal */
        _cloneData: { type: Object, state: true },
        /** Internal: whether the logged-in user has the maint role */
        _isMaintUser: { type: Boolean, state: true },
        /** Internal: show delete confirmation modal */
        _showDeleteModal: { type: Boolean, state: true },
        /** Internal: item pending deletion */
        _deleteItemData: { type: Object, state: true },
        /** Internal: deletion in progress */
        _deleting: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this.subtitle = '';
        // mode and experienceId are passed via widget instance metadata
        this.mode = 'widget-builder';
        this.experienceId = '';
        this._dashboardSysId = '';
        this._widgets = [];
        this._loading = true;
        this._error = '';
        this._showCreateModal = false;
        this._cloneData = null;
        this._activeView = 'grid';
        this._dashboardItems = [];
        this._visibleWidgetIds = new Set();
        this._pendingVisibilityChanges = new Map();
        this._batchTimeout = null;
        this._isMaintUser = false;
        this._showDeleteModal = false;
        this._deleteItemData = null;
        this._deleting = false;
    }

    // Map of mode → default subtitle (used as fallback when subtitle prop is empty)
    static _modeSubtitles = {
        'widget-builder': () => i18n.getMessage('Create and manage reusable UI components'),
        'dashboard-editor-list': () =>
            i18n.getMessage(
                'Widgets are used to personalize canvases. Configure which widgets are available and how they show up for users.',
            ),
    };

    get _resolvedSubtitle() {
        if (this.subtitle) return this.subtitle;
        return (
            AiuxBuilderWidgetList._modeSubtitles[this.mode] ?? AiuxBuilderWidgetList._modeSubtitles['widget-builder']
        )();
    }

    get _viewTabs() {
        return [
            {
                id: 'grid',
                label: html`<aiux-icon name="grid-four-outline" size="sm"></aiux-icon>`,
            },
            {
                id: 'list',
                label: html`<aiux-icon name="list-outline" size="sm"></aiux-icon>`,
            },
        ];
    }

    connectedCallback() {
        super.connectedCallback();
        this.server.update().then(() => {
            this._isMaintUser = !!this.data?.isMaintUser;
        });
        if (this.mode !== 'dashboard-editor-list') {
            this._fetchWidgets();
        }
    }

    // dashboard-editor-list: mode & experienceId are set late by aiux-lit-renderer, wait until both are present.
    updated(changedProps) {
        if (this.mode === 'dashboard-editor-list') {
            const modeChanged = changedProps.has('mode');
            const expChanged = changedProps.has('experienceId');
            if ((modeChanged || expChanged) && this.experienceId) {
                this._fetchDashboardData();
            }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._batchTimeout) {
            clearTimeout(this._batchTimeout);
            this._batchTimeout = null;
        }
        this._pendingVisibilityChanges.clear();
    }

    async _fetchDashboardData() {
        await this._fetchDashboardSysIdFromExperience();
        await this._fetchDashboardItems();
        await this._fetchWidgets();
    }

    // ── Data Fetching ─────────────────────────────────────────────────────

    get _entityService() {
        return window.aiuxBuilderEntityService;
    }

    async _fetchWidgets() {
        this._loading = true;
        this._error = '';

        try {
            // Wait for entity service to be available
            let retries = 0;
            while (!this._entityService && retries < 20) {
                await new Promise((r) => setTimeout(r, 100));
                retries++;
            }

            const widgets = await this._entityService.list('sys_aix_widget', {
                limit: 100,
                query: 'category!=system^category!=internal^idNOT LIKEwb-^nameNOT LIKEAiux^nameNOT LIKEAIUX',
                orderBy: 'sys_updated_on',
                orderDesc: true,
                fields: [
                    'sys_id',
                    'name',
                    'id',
                    'description',
                    'category',
                    'servicenow',
                    'sys_updated_on',
                    'sys_created_by',
                    'sys_policy',
                    'roles',
                ],
                displayValue: true,
            });

            const str = (v) => {
                if (v == null) return '';
                if (typeof v === 'object') return v.display_value || v.value || '';
                return String(v);
            };

            this._widgets = widgets
                .map((w) => {
                    const sysId = w.sys_id?.value || w.sys_id;
                    const visible = this._visibleWidgetIds.has(sysId);
                    return {
                        id: sysId,
                        type: str(w.servicenow) === 'true' ? 'servicenow' : 'custom',
                        name: str(w.name) || 'Untitled',
                        widgetId: str(w.id),
                        description: str(w.description) || i18n.getMessage('No description'),
                        category: str(w.category) || 'custom',
                        bestFor: str(w.best_for) || '',
                        date: this._formatDate(w.sys_updated_on?.value || w.sys_updated_on),
                        employee_visible: visible,
                        createdBy: w.sys_created_by?.display_value || str(w.sys_created_by) || '',
                        sys_policy: w.sys_policy?.display_value || '',
                        roles: str(w.roles),
                    };
                });
        } catch (err) {
            console.error('[AIUXWidgetListExplorer] Failed to fetch widgets:', err);
            this._error = i18n.getMessage('Failed to load widgets');
            this._widgets = [];
        } finally {
            this._loading = false;
        }
    }

    async _fetchDashboardSysIdFromExperience() {
        try {
            const experienceId = this.experienceId;

            // Wait for entity service to be available
            let retries = 0;
            while (!this._entityService && retries < 20) {
                await new Promise((r) => setTimeout(r, 100));
                retries++;
            }

            if (!this._entityService) {
                console.warn('[AIUXWidgetListExplorer] Entity service not available for fetching dashboard sys_id');
                return;
            }

            const m2mRecords = await this._entityService.list('sys_aix_m2m_experience_dashboard', {
                query: `experience=${experienceId}`,
                limit: 1,
                fields: ['sys_id', 'dashboard'],
                displayValue: true,
            });

            if (m2mRecords && m2mRecords.length > 0) {
                this._dashboardSysId = m2mRecords[0].dashboard?.value || m2mRecords[0].dashboard;
            } else {
                console.warn('[AIUXWidgetListExplorer] No dashboard found for experience:', experienceId);
            }
        } catch (err) {
            console.error('[AIUXWidgetListExplorer] Failed to fetch dashboard sys_id from experience:', err);
        }
    }

    async _fetchDashboardItems() {
        if (!this._dashboardSysId) {
            console.warn('[AIUXWidgetListExplorer] No dashboard sys_id configured');
            return;
        }

        const apiUrl = `/api/now/aix/dashboard/items/${this._dashboardSysId}`;

        try {
            const response = await snHttp.get(apiUrl, {
                headers: this._getHeaders(),
            });

            const dashboardItems = response?.data?.result || [];
            this._dashboardItems = dashboardItems;
            this._visibleWidgetIds = new Set(dashboardItems.map((item) => item.widget));
        } catch (err) {
            console.error('[AIUXWidgetListExplorer] Failed to fetch dashboard items:', err.response?.data || err);
        }
    }

    _formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return dateStr;
        }
    }

    // ── Event Handlers ────────────────────────────────────────────────────

    _handleWidgetCreate() {
        locationService.navigate('edit/widget/-1');
    }

    _handleCloseCreateModal() {
        this._showCreateModal = false;
        this._cloneData = null;
    }

    _handleWidgetCreated(e) {
        const widget = e.detail?.widget;
        const sysId = e.detail?.sysId || (typeof widget === 'string' ? widget : (widget?.sys_id?.value || widget?.sys_id));
        this._showCreateModal = false;
        this._cloneData = null;

        // Navigation is also handled by the create modal; this is a fallback
        if (sysId) {
            locationService.navigate(`edit/widget/${sysId}`);
        }

        this._fetchWidgets();
    }

    _handleWidgetSelect(e) {
        const item = e.detail?.item;
        if (item?.id) {
            this._navigateToWidget(item.id);
        }
    }

    _handleWidgetAction(e) {
        const { item, action } = e.detail || {};
        if (!item) return;

        switch (action) {
            case 'edit':
                this._navigateToWidget(item.id);
                break;
            case 'clone':
                this._cloneWidget(item);
                break;
            case 'delete':
                this._showDeleteConfirmation(item);
                break;
        }
    }

    _navigateToWidget(widgetId) {
        this.dispatchEvent(
            new CustomEvent('widget-navigate', {
                detail: { widgetId },
                bubbles: true,
                composed: true,
            }),
        );

        locationService.navigate(`edit/widget/${widgetId}`);
    }

    async _cloneWidget(item) {
        if (!this._entityService) return;

        try {
            const widget = await this._entityService.get('sys_aix_widget', item.id);
            if (!widget) return;

            const str = (v) => {
                if (v == null) return '';
                if (typeof v === 'object') return v.value != null ? String(v.value) : '';
                return String(v);
            };

            // Open create modal pre-populated with source widget data
            this._cloneData = {
                name: str(widget.name),
                id: str(widget.id),
                description: str(widget.description),
                component: str(widget.component),
                script: str(widget.script),
                input_schema: str(widget.input_schema) || '{}',
                client_tools: str(widget.client_tools) || '{}',
                dependent_widget_ids: str(widget.dependent_widget_ids),
                best_for: str(widget.best_for),
            };
            this._showCreateModal = true;
        } catch (err) {
            console.error('[AIUXWidgetListExplorer] Clone failed:', err);
        }
    }

    _showDeleteConfirmation(item) {
        this._deleteItemData = item;
        this._showDeleteModal = true;
    }

    _closeDeleteModal() {
        if (this._deleting) return;
        this._showDeleteModal = false;
        this._deleteItemData = null;
    }

    async _confirmDelete() {
        if (!this._deleteItemData) return;
        
        this._deleting = true;
        try {
            await this._deleteWidget(this._deleteItemData);
            this._showDeleteModal = false;
            this._deleteItemData = null;
        } catch (err) {
            console.error('[AIUXWidgetListExplorer] Delete confirmation failed:', err);
        } finally {
            this._deleting = false;
        }
    }

    async _deleteWidget(item) {
        if (!this._entityService) return;
        await this._entityService.delete('sys_aix_widget', item.id);
        this._fetchWidgets();
    }

    /**
     * Handles widget visibility toggle events.
     * Uses optimistic UI updates and batches multiple changes into a single API call.
     *
     * @param {CustomEvent} e - Event with detail: { sysId, visible }
     */
    async _handleVisibilityChange(e) {
        const { sysId, visible } = e.detail || {};
        if (!sysId || !this.experienceId) return;

        // Step 1: Track the change (original state + current state)
        this._trackVisibilityChange(sysId, visible);

        // Step 2: Update UI immediately (optimistic update)
        this._updateWidgetVisibility(sysId, visible);

        // Step 3: Debounce the API call (wait 300ms for more changes)
        this._scheduleBatchUpdate();
    }

    /**
     * Tracks a visibility change, storing both original and current state.
     * This allows us to calculate the net change later.
     *
     * @param {string} sysId - Widget sys_id
     * @param {boolean} visible - New visibility state
     */
    _trackVisibilityChange(sysId, visible) {
        if (!this._pendingVisibilityChanges.has(sysId)) {
            // First change: Store original state from current data
            const originalState = this._visibleWidgetIds.has(sysId);
            this._pendingVisibilityChanges.set(sysId, {
                original: originalState,
                current: visible,
            });
        } else {
            // Subsequent change: Update current state, keep original
            this._pendingVisibilityChanges.get(sysId).current = visible;
        }
    }

    /**
     * Schedules a batch API call after 300ms of inactivity.
     * Resets the timer if called again (debouncing).
     */
    _scheduleBatchUpdate() {
        if (this._batchTimeout) {
            clearTimeout(this._batchTimeout);
        }
        this._batchTimeout = setTimeout(() => {
            this._processBatchVisibilityChanges();
        }, 500);
    }

    /**
     * Processes all pending visibility changes in a single batch API call.
     * Only sends net changes (original → current) to avoid conflicts.
     *
     * Flow:
     * 1. Collect all pending changes
     * 2. Calculate net changes (skip if toggled back to original)
     * 3. Send single API request with all changes
     * 4. Refresh dashboard items on success
     * 5. Revert optimistic updates on failure
     */
    async _processBatchVisibilityChanges() {
        if (!this._dashboardSysId) return;

        // Collect and clear pending changes
        const changes = Array.from(this._pendingVisibilityChanges.entries());
        this._pendingVisibilityChanges.clear();
        this._batchTimeout = null;

        if (changes.length === 0) return;

        // Build API payload with net changes only
        const items = this._buildBatchPayload(changes);
        if (items.length === 0) return; // No net changes

        // Send batch request, grouped by scope
        try {
            const scopeGroups = this._groupByScope(items);
            await Promise.all(
                [...scopeGroups.entries()].map(([scope, scopedItems]) =>
                    this._sendBatchRequest(scopedItems, scope || undefined),
                ),
            );
            await this._fetchDashboardItems();
        } catch (err) {
            console.error('[AIUXWidgetListExplorer] Batch update failed:', err.response?.data || err);
            this._revertChanges(changes);
        }
    }

    /**
     * Builds the API payload by calculating net changes.
     *
     * @param {Array} changes - Array of [sysId, {original, current}] entries
     * @returns {Array} API items array with add/delete operations
     *
     * Examples:
     * - original: false, current: true  → ADD
     * - original: true,  current: false → DELETE
     * - original: false, current: false → SKIP (no change)
     * - original: true,  current: true  → SKIP (no change)
     */
    _buildBatchPayload(changes) {
        const items = [];

        for (const [sysId, { original, current }] of changes) {
            // Skip if no net change (toggled back to original)
            if (original === current) continue;

            // Add operation: was hidden, now visible
            if (!original && current) {
                items.push({
                    action: 'added',
                    widgetSysId: sysId,
                    category: 'library',
                });
            }
            // Delete operation: was visible, now hidden
            else if (original && !current) {
                const dashboardItem = this._dashboardItems.find((item) => item.widget === sysId);
                if (dashboardItem?.sys_id) {
                    items.push({
                        sysId: dashboardItem.sys_id,
                        action: 'deleted',
                        _scope: dashboardItem.sys_scope ?? null,
                    });
                }
            }
        }

        return items;
    }

    /**
     * Groups items by their `_scope` field (internal field, stripped before sending).
     * Items without a scope (added items) are grouped under `null`.
     *
     * @param {Array} items - Items from _buildBatchPayload (may have _scope field)
     * @returns {Map<string|null, Array>} Map of scope → items (with _scope stripped)
     */
    _groupByScope(items) {
        const groups = new Map();
        for (const item of items) {
            const scope = item._scope ?? null;
            if (!groups.has(scope)) groups.set(scope, []);
            const { _scope, ...cleanItem } = item;
            groups.get(scope).push(cleanItem);
        }
        return groups;
    }

    /**
     * Sends the batch request to the dashboard API.
     *
     * @param {Array} items - Array of add/delete operations
     * @param {string} [scope] - Optional application scope (sysparm_transaction_scope)
     */
    async _sendBatchRequest(items, scope) {
        const url = scope
            ? `/api/now/aix/dashboard/dashboard-item?sysparm_transaction_scope=${encodeURIComponent(scope)}`
            : '/api/now/aix/dashboard/dashboard-item';

        const payload = {
            sysId: this._dashboardSysId,
            items: items,
        };

        await snHttp.post(url, { data: payload }, { headers: this._getHeaders() });
    }

    /**
     * Reverts all optimistic UI updates back to original state.
     * Called when the batch API request fails.
     *
     * @param {Array} changes - Array of [sysId, {original, current}] entries
     */
    _revertChanges(changes) {
        for (const [sysId, { original }] of changes) {
            this._updateWidgetVisibility(sysId, original);
        }
    }

    _updateWidgetVisibility(sysId, visible) {
        if (visible) {
            this._visibleWidgetIds.add(sysId);
        } else {
            this._visibleWidgetIds.delete(sysId);
        }
        this._widgets = this._widgets.map((w) => (w.id === sysId ? { ...w, employee_visible: visible } : w));
    }

    _getHeaders() {
        const userToken = typeof g_ck !== 'undefined' ? g_ck : '';
        return {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-UserToken': userToken,
        };
    }

    // ── Render ────────────────────────────────────────────────────────────

    _renderContent() {
        if (this._loading) {
            if (this.mode === 'widget-builder') {
                return html`<aiux-loader class="page-loader" size="xl" label="${i18n.getMessage('Loading...')}"></aiux-loader>`;
            }
            return html`<now-loader size="lg"></now-loader>`;
        }

        if (this._error) {
            return html`<div class="error-state">${this._error}</div>`;
        }

        const isConfMode = this.mode === 'dashboard-editor-list';

        if (isConfMode) {
            return html`
                <aiux-widget-list
                    mode="${this.mode}"
                    subtitle="${this._resolvedSubtitle}"
                    show-header
                    .items=${this._widgets}
                    @wb-widget-create=${this._handleWidgetCreate}
                    @wb-visibility-change=${this._handleVisibilityChange}
                ></aiux-widget-list>
            `;
        }

        const isListView = this._activeView === 'list';
        return html`
            <aiux-widget-gallery
                title="${i18n.getMessage('Widgets')}"
                subtitle="${this._resolvedSubtitle}"
                .items=${this._widgets}
                ._viewTabs=${this._viewTabs}
                ._activeView="${this._activeView}"
                ?loading=${this._loading}
                ._hideGrid=${isListView}
                ?isMaintUser=${this._isMaintUser}
                @widget-create=${this._handleWidgetCreate}
                @widget-select=${this._handleWidgetSelect}
                @widget-action=${this._handleWidgetAction}
                @view-change="${(e) => (this._activeView = e.detail.view)}"
            >
                ${isListView
                    ? html`
                          <aiux-widget-list
                              mode="${this.mode}"
                              .items=${this._widgets}
                              @wb-widget-create=${this._handleWidgetCreate}
                          ></aiux-widget-list>
                      `
                    : nothing}
            </aiux-widget-gallery>
        `;
    }

    _renderDeleteModal() {
        if (!this._showDeleteModal || !this._deleteItemData) return nothing;

        return html`
            <aiux-dialog
                ?open=${this._showDeleteModal}
                size="md"
                show-close-button
                close-on-escape
                ?disable-close=${this._deleting}
                dialog-label="${i18n.getMessage('Delete widget')}"
                @aix-dialog-close=${this._closeDeleteModal}
            >
                <div slot="header">
                    <div class="delete-dialog-title">${i18n.getMessage('Delete widget')}</div>
                </div>

                <div class="delete-dialog-content">
                    <p>
                        ${i18n.getMessage('Are you sure you want to delete the widget? This action cannot be undone.')}
                    </p>
                </div>

                <div slot="footer" class="dialog-footer">
                    <button class="aiux-btn aiux-btn-ghost" @click=${this._closeDeleteModal} ?disabled=${this._deleting}>
                        ${i18n.getMessage('Cancel')}
                    </button>
                    <button class="aiux-btn aiux-btn-error" @click=${this._confirmDelete} ?disabled=${this._deleting}>
                        ${this._deleting ? i18n.getMessage('Deleting...') : i18n.getMessage('Delete')}
                    </button>
                </div>
            </aiux-dialog>
        `;
    }

    render() {
        return html`
            <div class="widget-list-page">
                <!-- Main Content -->
                <main class="page-content page-content--animate">${this._renderContent()}</main>

                <!-- Create Widget Modal -->
                <aiux-create-modal
                    ?open=${this._showCreateModal}
                    .cloneData=${this._cloneData}
                    @ds-close=${this._handleCloseCreateModal}
                    @widget-created=${this._handleWidgetCreated}
                ></aiux-create-modal>

                <!-- Delete Confirmation Modal -->
                ${this._renderDeleteModal()}
            </div>

            <!-- Entity Service (headless) -->
            <aiux-entity-service></aiux-entity-service>
        `;
    }

    // ── Styles ────────────────────────────────────────────────────────────

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            font-family: var(--font-servicenow, 'Servicenow Sans', sans-serif);
        }

        .widget-list-page {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
        }

        .page-content {
            flex: 1;
            overflow-y: auto;
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(var(--slide-offset-sm, 1rem));
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .page-content--animate {
            animation: fadeInUp 0.5s var(--ease-enter, ease) both;
        }

        .page-loader {
            height: 100%;
        }

        .error-state {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: calc(var(--spacing, 0.25rem) * 16) calc(var(--spacing, 0.25rem) * 6);
            font-size: var(--text-sm, 0.875rem);
            color: var(--color-error, #dc2626);
        }

        @media (prefers-reduced-motion: reduce) {
            .page-content--animate {
                animation: none;
            }
        }

        /* ── Delete Dialog ──────────────────────────────────────────────────── */
        .delete-dialog-title {
            font-size: var(--text-base, 1rem);
            font-weight: 600;
            color: var(--color-text-primary, #111827);
        }

        .delete-dialog-content {
            padding: 1rem 0;
        }

        .delete-dialog-content p {
            margin: 0;
            line-height: 1.5;
            color: var(--color-text-secondary, #4b5563);
        }

        .delete-dialog-content strong {
            color: var(--color-text-primary, #111827);
            font-weight: 600;
        }

        .dialog-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }
    `;
}
