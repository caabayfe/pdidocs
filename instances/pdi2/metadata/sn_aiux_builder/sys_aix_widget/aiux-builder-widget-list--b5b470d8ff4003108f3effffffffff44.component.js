import { html, css, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n, locationService } from '@servicenow/aiux-services';



// ─────────────────────────────────────────────────────────────────────────────
// Row renderer helpers
// ─────────────────────────────────────────────────────────────────────────────

function renderTextCell(value) {
    return html`<span class="cell-text" title="${value ?? ''}">${value ?? ''}</span>`;
}

function renderToggleCell(value, onToggle) {
    return html`
        <input
            type="checkbox"
            class="cell-toggle"
            .checked="${Boolean(value)}"
            aria-label="${i18n.getMessage('Toggle employee visibility')}"
            title="${value ? i18n.getMessage('Disable employee visibility') : i18n.getMessage('Enable employee visibility')}"
            @change="${(e) => onToggle?.(e.target.checked)}"
        />
    `;
}

function renderLinkCell(href, useDirectNav = false) {
    const onClick = useDirectNav
        ? () => window.open(href, '_blank')
        : () => locationService.navigate(href, { target: '_blank' });
    return html`
        <button
            class="cell-link"
            aria-label="${i18n.getMessage('Open in editor')}"
            title="${i18n.getMessage('Open in editor')}"
            @click="${onClick}"
        >
            <aiux-icon name="open-link-right" size="sm" aria-hidden="true"></aiux-icon>
        </button>
    `;
}

function renderRolesCell(rolesString, sysId, isExpanded, onToggle) {
    if (!rolesString) return html`<span class="cell-text"></span>`;
    const roles = rolesString.split(',').map(r => r.trim()).filter(Boolean);
    const count = roles.length;
    if (count === 0) return html`<span class="cell-text"></span>`;
    
    return html`
        <div class="roles-cell">
            <div class="roles-toggle-wrapper">
                <button
                    class="roles-toggle"
                    @click="${() => onToggle?.(sysId)}"
                    aria-expanded="${isExpanded ? 'true' : 'false'}"
                    aria-label="${isExpanded ? 'Collapse roles' : 'Expand roles'}"
                >
                    <span class="roles-badge">
                        ${count} ${count === 1 ? 'role' : 'roles'}
                    </span>
                    <aiux-icon 
                        name="${isExpanded ? 'chevron-up' : 'chevron-down'}" 
                        size="sm" 
                        class="roles-icon"
                        aria-hidden="true"
                    ></aiux-icon>
                </button>
                ${isExpanded ? html`
                    <div class="roles-dropdown">
                        ${roles.map(role => html`<div class="role-item">${role}</div>`)}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * WB DS Widget List
 *
 * Pure display component that renders sys_aix_widget records in a table.
 * Items are provided by the parent; data fetching and pagination are handled
 * externally by wb-entity-service + aiux-pagination-nav.
 *
 * When mode='dashboard-editor-list' an additional Employee Visibility column
 * is shown with toggle controls.
 *
 * @property {String}  mode     'widget-builder' | 'dashboard-editor-list'
 * @property {Array}   items    Widget records for the current page (provided by parent)
 * @property {String}  title    Page heading
 * @property {String}  subtitle Page sub-heading
 *
 * @fires wb-widget-create     Create widget button clicked
 * @fires wb-visibility-change Visibility toggle changed (detail: { sysId, visible })
 */
class AiuxWbWidgetList extends AIUXWidgetElement {
    static properties = {
        mode: {
            type: String,
            description: "Display mode. 'widget-builder' standard view; 'dashboard-editor-list' adds Employee Visibility column.",
        },
        items: {
            type: Array,
            description: 'Current page of widget records provided by the parent.',
        },
        /** Main heading shown in the section header. */
        title: { type: String },
        /** Sub-heading shown below the title in the section header. */
        subtitle: { type: String },
        /** When true, renders the section header above the toolbar. */
        showHeader: { type: Boolean, attribute: 'show-header' },

        // ── internal ─────────────────────────────────────────────────────
        _searchQuery:  { type: String, state: true },
        _currentPage:  { type: Number, state: true },
        _pageSize:     { type: Number, state: true },
        _expandedRoles: { type: Set, state: true },
    };

    constructor() {
        super();
        this.mode         = 'widget-builder';
        this.items        = [];
        this.showHeader   = false;
        this.title        = i18n.getMessage('Widgets');
        this.subtitle     = i18n.getMessage('Widgets are used to personalize canvases. Configure which widgets are available and how they show up for users.');
        this._searchQuery = '';
        this._currentPage = 0;
        this._pageSize    = 10;
        this._expandedRoles = new Set();
    }

    // ── Pagination helpers ────────────────────────────────────────────────

    get _visibleItems() {
        const start = this._currentPage * this._pageSize;
        return this._filteredItems.slice(start, start + this._pageSize);
    }

    get _totalPages() {
        return Math.ceil(this._filteredItems.length / this._pageSize);
    }

    _handlePageChange(e) {
        const newPage = e.detail.page - 1;
        if (newPage >= 0 && newPage < this._totalPages) {
            this._currentPage = newPage;
            this.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // ── Event handlers ────────────────────────────────────────────────────

    _toggleRolesExpanded(sysId) {
        if (this._expandedRoles.has(sysId)) {
            this._expandedRoles.delete(sysId);
        } else {
            this._expandedRoles.add(sysId);
        }
        this._expandedRoles = new Set(this._expandedRoles);
    }

    _onRowToggle(sysId, checked) {
        this.dispatchEvent(
            new CustomEvent('wb-visibility-change', {
                detail: { sysId, visible: checked },
                bubbles: true,
                composed: true,
            }),
        );
    }

    // ── Render helpers ────────────────────────────────────────────────────

    _renderSectionHeader() {
        return html`
            <div class="section-header">
                <div class="header-text">
                    <h1 class="section-title">${this.title}</h1>
                    <p class="section-subtitle">${this.subtitle}</p>
                </div>
            </div>
        `;
    }

    _renderToolbar() {
        return html`
            <div class="list-toolbar">
                <span class="list-title">${i18n.getMessage('Widget list')}</span>
                <div class="list-toolbar-actions">
                    <!-- Search -->
                    <div class="toolbar-search">
                        <aiux-icon name="magnifying-glass" size="sm" class="search-icon" aria-hidden="true"></aiux-icon>
                        <input
                            class="search-input"
                            type="search"
                            placeholder="${i18n.getMessage('Search')}"
                            .value="${this._searchQuery}"
                            @input="${(e) => { this._searchQuery = e.target.value; this._currentPage = 0; }}"
                            aria-label="${i18n.getMessage('Search widgets')}"
                        />
                    </div>
                    <!-- Create widget -->
                    ${this.mode === 'dashboard-editor-list' ? html`
                        <button
                            class="create-btn"
                            @click="${() => window.open('/aiux/builder/edit/widget/-1', '_blank')}"
                            aria-label="${i18n.getMessage('Create new widget')}"
                        >
                            <span>${i18n.getMessage('Create new widget')}</span>
                            <aiux-icon name="open-link-right" size="sm" aria-hidden="true"></aiux-icon>
                        </button>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    _renderTableHead() {
        const showVisibility = this.mode === 'dashboard-editor-list';
        return html`
            <thead>
                <tr>
                    <th scope="col">${i18n.getMessage('Name')}</th>
                    <th scope="col">${i18n.getMessage('Description')}</th>
                    <th scope="col">${i18n.getMessage('ID')}</th>
                    ${showVisibility
                        ? html`<th scope="col">${i18n.getMessage('Roles')}</th>`
                        : ''}
                    ${showVisibility
                        ? html`<th scope="col" class="th-center">${i18n.getMessage('Employee visibility')}</th>`
                        : ''}
                    <th scope="col" aria-label="${i18n.getMessage('Actions')}"></th>
                </tr>
            </thead>
        `;
    }

    _renderRow(row, index) {
        const isVisible      = row.employee_visible === 'true' || row.employee_visible === true;
        const sysId          = row.sys_id?.value || row.sys_id || row.id;
        const href           = '/aiux/builder/edit/widget/' + sysId;
        const showVisibility = this.mode === 'dashboard-editor-list';

        return html`
            <tr class="${index % 2 === 0 ? 'row-even' : 'row-odd'}">
                <td>${renderTextCell(row.name)}</td>
                <td>${renderTextCell(row.description)}</td>
                <td>${renderTextCell(row.widgetId || row.id)}</td>
                ${showVisibility
                    ? html`<td class="roles-cell-container">${renderRolesCell(row.roles, sysId, this._expandedRoles.has(sysId), (id) => this._toggleRolesExpanded(id))}</td>`
                    : ''}
                ${showVisibility
                    ? html`
                          <td class="cell-center">
                              ${renderToggleCell(isVisible, (v) => this._onRowToggle(sysId, v))}
                          </td>
                      `
                    : ''}
                <td class="cell-center">${renderLinkCell(href, this.mode === 'dashboard-editor-list')}</td>
            </tr>
        `;
    }

    get _filteredItems() {
        const q = this._searchQuery.trim().toLowerCase();
        const all = this.items || [];
        if (!q) return all;
        return all.filter((r) =>
            (r.name || '').toLowerCase().includes(q) ||
            (r.description || '').toLowerCase().includes(q) ||
            (r.widgetId || r.id || '').toLowerCase().includes(q) ||
            (r.bestFor || '').toLowerCase().includes(q) ||
            (r.roles || '').toLowerCase().includes(q),
        );
    }

    _renderTableBody() {
        const rows = this._visibleItems;
        const showVisibility = this.mode === 'dashboard-editor-list';
        const colSpan = showVisibility ? 6 : 4;

        if (this._filteredItems.length === 0) {
            return html`
                <tr>
                    <td colspan="${colSpan}" class="state-cell">
                        ${i18n.getMessage('No widgets found.')}
                    </td>
                </tr>
            `;
        }
        return repeat(
            rows,
            (r) => r.sys_id?.value || r.sys_id || r.id,
            (r, i) => this._renderRow(r, i),
        );
    }

    render() {
        const showVisibility = this.mode === 'dashboard-editor-list';

        return html`
            <div class="configurer-container">
                ${this.showHeader ? this._renderSectionHeader() : nothing}
                ${this._renderToolbar()}

                <div class="list-container" role="region" aria-label="${i18n.getMessage('Widget list')}">
                    <table class="list-table">
                        <colgroup>
                            <col class="col-name" />
                            <col class="col-description" />
                            <col class="col-id" />
                            ${showVisibility ? html`<col class="col-roles" />` : ''}
                            ${showVisibility ? html`<col class="col-visibility" />` : ''}
                            <col class="col-actions" />
                        </colgroup>
                        ${this._renderTableHead()}
                        <tbody>
                            ${this._renderTableBody()}
                        </tbody>
                    </table>

                    ${this._filteredItems.length > this._pageSize ? html`
                        <div class="pagination-container">
                            <aiux-pagination-nav
                                current-page="${this._currentPage + 1}"
                                total-pages="${this._totalPages}"
                                max-buttons="7"
                                show-prev-next
                                @pagination-page-change="${this._handlePageChange}"
                            ></aiux-pagination-nav>
                        </div>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    static styles = css`
        :host {
            display: block;
            height: 100%;
            font-family: var(--now-font-family);
        }

        /* ── Container ───────────────────────────────────────────────────── */
        .configurer-container {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            background: var(--color-background-primary, #fff);
        }

        /* ── Section header ─────────────────────────────────────────────── */
        .section-header {
            display: flex;
            align-items: flex-start;
            padding: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 4) 0;
            animation: fadeInUp 0.5s var(--ease-enter, ease) both;
        }

        .header-text {
            display: flex;
            flex-direction: column;
            gap: calc(var(--spacing) * 1);
        }

        .section-title {
            margin: 0;
            font-size: 1.5rem;
            font-weight: var(--font-weight-bold, 700);
            color: var(--color-text-primary, #1e293b);
            line-height: var(--leading-tight, 1.25);
        }

        .section-subtitle {
            margin: 0;
            font-size: 1rem;
            color: var(--color-text-primary, #1e293b);
            max-width: 36.25rem;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(var(--slide-offset-sm, 1rem)); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Toolbar ─────────────────────────────────────────────────────── */
        .list-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: calc(var(--spacing) * 3);
            padding:0 calc(var(--spacing) * 3) calc(var(--spacing) * 4) 0;
        }

        .list-title {
            font-size: 1.125rem;
            font-weight: var(--font-weight-bold, 700);
            color: var(--color-text-primary, #1e293b);
            white-space: nowrap;
            flex-shrink: 0;
        }

        .list-toolbar-actions {
            display: flex;
            align-items: center;
            gap: calc(var(--spacing) * 3);
            flex-shrink: 0;
        }

        /* Search */
        .toolbar-search {
            display: flex;
            align-items: center;
            gap: calc(var(--spacing) * 2);
            height: calc(var(--spacing) * 8);
            padding: 0 calc(var(--spacing) * 3);
            background: var(--color-base-100, #fff);
            border: 1px solid var(--color-base-200);
            border-radius: var(--radius-xl, 0.75rem);
            width: 20rem;
            box-sizing: border-box;
        }
        .toolbar-search:focus-within {
            border-color: var(--color-primary, #3b82f6);
            box-shadow: 0 0 0 0.125rem color-mix(in srgb, var(--color-primary, #3b82f6) 10%, transparent);
        }

        .search-icon { color: var(--color-base-content-secondary, #6b7280); flex-shrink: 0; }

        .search-input {
            flex: 1;
            border: none;
            outline: none;
            font-size: var(--text-sm, 0.875rem);
            color: rgb(var(--color-text-primary));
            background: transparent;
            min-width: 0;
        }
        .search-input::placeholder { color: var(--color-base-content-secondary, #6b7280); }

        /* Create button */
        .create-btn {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: calc(var(--spacing) * 1.5);
            height: calc(var(--spacing) * 8);
            padding: 0 calc(var(--spacing) * 4.5);
            border-radius: var(--radius-xl, 0.75rem);
            border: none;
            background: var(--now-color_brand, #0E4E69);
            color: var(--now-color_brand-text, #FFF);
            font-size: var(--text-sm, 0.875rem);
            font-weight: var(--font-weight-medium, 500);
            cursor: pointer;
            white-space: nowrap;
            transition: opacity 0.15s var(--ease-enter, ease);
        }
        .create-btn:hover         { opacity: 0.88; }
        .create-btn:focus-visible { outline: 0.125rem solid var(--now-color_brand, #0E4E69); outline-offset: 0.125rem; }

        .icon-on-primary { color: #fff; }

        /* ── Pagination ──────────────────────────────────────────────────── */
        .pagination-container {
            display: flex;
            justify-content: center;
            padding: calc(var(--spacing) * 4) calc(var(--spacing) * 6);
            border-top: 1px solid var(--color-base-200, #f1f5f9);
        }

        /* ── Table container ─────────────────────────────────────────────── */
        .list-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            overflow: auto;
        }

        /* ── Table ───────────────────────────────────────────────────────── */
        .list-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        col.col-name        { width: 18%; }
        col.col-description { width: 28%; }
        col.col-id          { width: 16%; }
        col.col-roles       { width: 10rem; }
        col.col-visibility  { width: 10rem; }
        col.col-actions     { width: 3.75rem; }

        thead {
            position: sticky;
            top: 0;
            z-index: 1;
            background: var(--color-background-primary, #fff);
        }

        th, .cell-text {
            font-size: var(--font-size-base, 1rem);
            color: rgb(var(--color-text-primary));
        }

        th {
            padding: 1rem 0.5rem 1rem 1.5rem;
            font-weight: var(--font-weight-normal, 400);
            line-height: 1.5rem;
            text-align: left;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .th-center { text-align: center; }

        tbody tr {
            position: relative;
        }
        tbody tr.row-even { background: var(--color-base-200); }
        tbody tr.row-odd  { background: transparent; }
        tbody tr:hover    { background: var(--color-base-300); }

        td {
            padding: 1rem 0.5rem 1rem 1.5rem;
            overflow: hidden;
            vertical-align: middle;
        }
        .cell-center { text-align: center; padding-inline-start: 0.667rem; }
        
        tbody tr:has(.roles-dropdown) {
            z-index: 100;
        }

        .cell-text {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: var(--font-weight-light, 300);
            line-height: 1.5rem;
        }

        /* ── Toggle ──────────────────────────────────────────────────────── */
        .cell-toggle {
            appearance: none;
            -webkit-appearance: none;
            flex-shrink: 0;
            width: 2.25rem;
            height: 1.25rem;
            border-radius: 0.625rem;
            background-color: var(--color-base-200, #e2e8f0);
            border: 0.09375rem solid var(--color-base-400, #94a3b8);
            cursor: pointer;
            position: relative;
            transition: background-color var(--duration-medium, 0.2s) var(--ease-enter, ease),
                        border-color var(--duration-medium, 0.2s) var(--ease-enter, ease);
            vertical-align: middle;
        }
        .cell-toggle:checked {
            background-color: var(--color-neutral, #293e54);
            border-color: var(--color-neutral, #293e54);
        }
        .cell-toggle::before {
            content: '';
            position: absolute;
            inset-block-start: 50%;
            inset-inline-start: 0.1875rem;
            transform: translateY(-50%);
            width: 0.875rem;
            height: 0.875rem;
            border-radius: 50%;
            background-color: var(--color-base-100, #fff);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
            transition: inset-inline-start var(--duration-medium, 0.2s) var(--ease-enter, ease);
        }
        .cell-toggle:checked::before {
            inset-inline-start: calc(100% - 0.1875rem - 0.875rem);
        }
        .cell-toggle:focus-visible {
            outline: 0.125rem solid var(--color-neutral, #293e54);
            outline-offset: 0.125rem;
        }

        /* ── Link button ─────────────────────────────────────────────────── */
        .cell-link {
            display: inline-flex;
            align-items: center;
            color: var(--color-neutral, #293e54);
            cursor: pointer;
            border-radius: var(--radius-sm, 0.25rem);
            border: none;
            background: transparent;
            outline-offset: 0.125rem;
        }
        .cell-link:hover         { opacity: 0.75; }
        .cell-link:focus-visible { outline: 0.125rem solid var(--color-neutral, #293e54); }

        /* ── Roles cell ──────────────────────────────────────────────────── */
        .roles-cell-container {
            position: relative;
            overflow: visible;
        }

        .roles-cell {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .roles-toggle-wrapper {
            position: relative;
            display: inline-flex;
        }

        .roles-toggle {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0;
            border: none;
            background: transparent;
            cursor: pointer;
            outline-offset: 0.125rem;
            background: var(--color-base-100, #fff);
            border-radius: 12px;
        }

        .roles-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.5rem;
            border-radius: var(--radius-sm, 0.25rem);
            font-size: var(--text-xs, 0.75rem);
            font-weight: var(--font-weight-medium, 500);
            color: var(--color-text-primary, #1e293b);
            white-space: nowrap;
            transition: background 0.15s ease;
        }

        .roles-icon {
            color: var(--color-base-content-secondary, #6b7280);
            flex-shrink: 0;
            margin-right: 6px;
        }

        .roles-dropdown {
            position: absolute;
            top: calc(100% + 0.25rem);
            right: 0;
            min-width: 12rem;
            max-width: 16rem;
            overflow-y: auto;
            background: var(--color-base-100, #fff);
            border: 1px solid var(--color-base-300, #cbd5e1);
            border-radius: var(--radius-md, 0.5rem);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            z-index: 1000;
            animation: slideDown 0.15s ease-out;
        }

        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-0.5rem);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .role-item {
            padding: 0.5rem 0.75rem;
            font-size: var(--text-sm, 0.875rem);
            color: var(--color-text-primary, #1e293b);
        }
        .role-item:last-child {
            border-bottom: none;
        }

        /* ── Empty state ─────────────────────────────────────────────────── */
        .state-cell {
            padding: calc(var(--spacing) * 4) calc(var(--spacing) * 6);
            font-size: var(--text-sm, 0.875rem);
            color: rgb(var(--color-text-secondary));
            text-align: center;
        }

        /* ── Responsive ──────────────────────────────────────────────────── */
        @media (max-width: 48rem) {
            col.col-description { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
            .cell-toggle,
            .cell-toggle::before { transition: none; }
        }
    `;
}
