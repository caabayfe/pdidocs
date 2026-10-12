import { html, css, nothing } from 'lit';
import { AIUXWidgetElement } from '@servicenow/aiux-components-core';
import { i18n, themeService } from '@servicenow/aiux-services';

import { getUser } from '@servicenow/aiux-utils';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-scope-picker';
import '@servicenow/glide-widgets/sn_aiux_builder/aiux-user-avatar';

const FILTER_OPTIONS = [
	{ value: '',           label: i18n.getMessage('All types') },
	{ value: 'custom',     label: i18n.getMessage('Custom') },
	{ value: 'servicenow', label: i18n.getMessage('ServiceNow') },
];

const SORT_OPTIONS = [
	{ value: 'recent', label: i18n.getMessage('Most recent') },
	{ value: 'oldest', label: i18n.getMessage('Oldest first') },
	{ value: 'name',   label: i18n.getMessage('Name A–Z') },
];

// ─────────────────────────────────────────────────────────────────────────────

class AiuxBuilderRecentWidgets extends AIUXWidgetElement {
	static properties = {
		/** Section heading */
		title:       { type: String },
		/** Section sub-heading */
		subtitle:    { type: String },
		/** Array of widget items — see DEFAULT_ITEMS for the shape */
		items:       { type: Array },
		/** Hide the header (title + create button) — used when embedded in home page */
		hideHeader:  { type: Boolean, attribute: 'hide-header' },
		/** Loading state — shows skeleton cards */
		loading:     { type: Boolean },
		/** When true, hides the card grid and renders the default slot instead (list view). */
		_hideGrid:   { type: Boolean, state: true },
		/** Tab definitions for the view switcher — array of { id, label } objects. */
		_viewTabs:   { type: Array,   state: true },
		/** Currently active view tab id (e.g. "grid" or "list"). */
		_activeView: { type: String,  state: true },
		/** Show the grid/list view toggle. Default hidden. */
		showViewToggle: { type: Boolean, attribute: 'show-view-toggle' },

		// ── internal state ─────────────────────────────────────────────
		_search:     { type: String,  state: true },
		_filter:     { type: String,  state: true },
		_sort:       { type: String,  state: true },
		_openMenuId: { type: String,  state: true },
		_currentPage: { type: Number, state: true },
		_pageSize:   { type: Number, state: true },
		_userMenuOpen: { type: Boolean, state: true },
		_theme:      { type: String, state: true },
		_userId:     { type: String, state: true },
		_userName:   { type: String, state: true },
		isMaintUser: { type: Boolean },
	};

	constructor() {
		super();
		this.title       = i18n.getMessage('Widgets');
		this.subtitle    = i18n.getMessage('Create and manage reusable UI components');
		this.items       = [];
		this.hideHeader  = false;
		this.loading     = false;
		this._hideGrid   = false;
		this._viewTabs   = [];
		this._activeView = '';
		this.showViewToggle = false;
		this._search     = '';
		this._filter     = '';
		this._sort       = 'recent';
		this._openMenuId = '';
		this._currentPage = 0;
		this._pageSize   = 12;
		this._userMenuOpen = false;
		this._theme      = 'light';
		this._userId     = '';
		this._userName   = '';
		this.isMaintUser = false;
		this._closeUserMenuOnOutsideClick = this._closeUserMenuOnOutsideClick.bind(this);
		this._onDocClick = this._onDocClick.bind(this);
	}

	connectedCallback() {
		super.connectedCallback();
		document.addEventListener('click', this._onDocClick);
		this._theme = themeService.getThemeMode?.() || 'light';
		const {userId='', firstName=''} = getUser() || {};
		this._userId = userId;
		this._userName = firstName;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		document.removeEventListener('click', this._onDocClick);
		document.removeEventListener('click', this._closeUserMenuOnOutsideClick);
	}

	// ── Close card menus when clicking outside ────────────────────────────

	_onDocClick() {
		if (this._openMenuId) {
			this._openMenuId = '';
		}
	}

	// ── Data helpers ──────────────────────────────────────────────────────

	get _filteredItems() {
		let list = [...(this.items || [])];

		// filter by type
		if (this._filter) {
			list = list.filter(i => i.type === this._filter);
		}

		// search by name or description
		const q = this._search.trim().toLowerCase();
		if (q) {
			list = list.filter(i =>
				i.name.toLowerCase().includes(q) ||
				(i.description || '').toLowerCase().includes(q)
			);
		}

		// sort
		if (this._sort === 'oldest') {
			list = list.reverse();
		} else if (this._sort === 'name') {
			list = list.sort((a, b) => a.name.localeCompare(b.name));
		}

		return list;
	}

	get _visibleItems() {
		const filtered = this._filteredItems;
		const start = this._currentPage * this._pageSize;
		const end = start + this._pageSize;
		return filtered.slice(start, end);
	}

	get _totalPages() {
		return Math.ceil(this._filteredItems.length / this._pageSize);
	}

	// ── Event emitters ────────────────────────────────────────────────────

	_emit(name, detail = {}) {
		this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
	}

	_handleCreate() {
		this._emit('widget-create');
	}

	_handleAction(item, action, e) {
		e.stopPropagation();
		this._openMenuId = '';
		this._emit('widget-action', { item, action });
	}

	_toggleMenu(id, e) {
		e.stopPropagation();
		this._openMenuId = this._openMenuId === id ? '' : id;
	}

	_handleFilterChange(e) {
		this._filter = e.target.value || '';
		this._currentPage = 0;
	}

	_handleFilterClear() {
		this._filter = '';
		this._currentPage = 0;
	}

	_handleSortChange(e) {
		this._sort = e.target.value || 'recent';
		this._currentPage = 0;
	}

	_handleSearchInput(e) {
		this._search = e.target.value || '';
		this._currentPage = 0;
	}

	_handlePageChange(e) {
		const newPage = e.detail.page - 1;
		if (newPage >= 0 && newPage < this._totalPages) {
			this._currentPage = newPage;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	// ─────────────────────────────────────────────────────────────────────
	// SVG icons
	// ─────────────────────────────────────────────────────────────────────

	_svgPlus() {
		return html`<aiux-icon name="plus-outline" size="sm"></aiux-icon>`;
	}


	_svgDots() {
		return html`<aiux-icon name="ellipsis-v-outline" size="md"></aiux-icon>`;
	}

	_svgPencil() {
		return html`<aiux-icon name="pencil-outline" size="xs" class="icon-action-edit"></aiux-icon>`;
	}

	_svgLock() {
		return html`<aiux-icon name="lock-outline" size="xs" class="icon-action-lock"></aiux-icon>`;
	}

	_svgCalendar() {
		return html`<aiux-icon name="calendar-outline" size="sm" class="icon-secondary"></aiux-icon>`;
	}

	// ── User menu ─────────────────────────────────────────────────────────

	_toggleUserMenu(e) {
		const popover = this.renderRoot?.getElementById('user-submenu');
		if (!popover) return;
		// Position popover below the avatar button
		const btn = e.currentTarget;
		const rect = btn.getBoundingClientRect();
		popover.style.top = `${rect.bottom + 8}px`;
		popover.style.right = `${window.innerWidth - rect.right}px`;
		popover.style.left = 'auto';
		popover.togglePopover();
	}

	_handleUserMenuToggle(e) {
		this._userMenuOpen = e.newState === 'open';
		if (this._userMenuOpen) {
			requestAnimationFrame(() => {
				document.addEventListener('click', this._closeUserMenuOnOutsideClick);
			});
		} else {
			document.removeEventListener('click', this._closeUserMenuOnOutsideClick);
		}
	}

	_closeUserMenuOnOutsideClick(e) {
		const path = e.composedPath();
		const popover = this.renderRoot?.getElementById('user-submenu');
		const avatarBtn = this.renderRoot?.querySelector('.avatar-btn');
		if (!path.includes(popover) && !path.includes(avatarBtn)) {
			popover?.hidePopover();
		}
	}

	_handleThemeToggle() {
		const nextTheme = this._theme === 'dark' ? 'light' : 'dark';
		themeService.setThemeMode(nextTheme);
		this._theme = nextTheme;
	}

	_logout() {
		window.location.href = '/logout.do?sysparm_goto_url=/builder';
	}

	// ─────────────────────────────────────────────────────────────────────
	// Render functions
	// ─────────────────────────────────────────────────────────────────────

	/** Section heading + CTA button */
	_renderHeader() {
		return html`
			<div class="section-header">
				<div class="header-text">
					<h1 class="section-title">${this.title}</h1>
					<p class="section-subtitle">${this.subtitle}</p>
				</div>
				<div class="header-actions">
					<aiux-scope-picker></aiux-scope-picker>
					<button
						class="aiux-btn aiux-btn-neutral aiux-btn-md gap-1"
						@click=${this._handleCreate}
						aria-label="Create new widget"
					>
						${this._svgPlus()}
						<span>${i18n.getMessage('Create widget')}</span>
					</button>
					${this._userId ? html`
						<button class="avatar-btn" @click=${this._toggleUserMenu} aria-label="${this._userName || 'User'}">
							<aiux-user-avatar sys-id="${this._userId}" size="lg"></aiux-user-avatar>
						</button>
					` : nothing}
				</div>
			</div>

			<!-- User menu popover -->
			<div id="user-submenu" class="user-menu" popover="manual" @toggle=${this._handleUserMenuToggle}>
				<div class="user-menu-item" role="button" tabindex="0" @click=${() => this._handleThemeToggle()}>
					<aiux-icon size="md" name="moon-outline"></aiux-icon>
					<span>${i18n.getMessage('Dark theme')}</span>
					<input type="checkbox" class="aiux-toggle aiux-toggle-sm" .checked=${this._theme === 'dark'} @click=${(e) => e.stopPropagation()} @change=${(e) => { e.stopPropagation(); this._handleThemeToggle(); }} />
				</div>
				<div class="user-menu-item" role="button" tabindex="0" @click=${this._logout}>
					<aiux-icon size="md" name="square-arrow-right-outline"></aiux-icon>
					<span>${i18n.getMessage('Logout')}</span>
				</div>
			</div>
		`;
	}

	/** Search + filter + sort toolbar */
	_renderToolbar() {
		return html`
			<div class="toolbar">
				${!this._hideGrid ? html`
				<div class="toolbar-field toolbar-search">
					<div class="search-input-wrap">
						<aiux-icon name="magnifying-glass-outline" size="md" class="search-icon"></aiux-icon>
						<input
							type="text"
							class="aiux-input aiux-input-md search-input"
							placeholder="${i18n.getMessage('Search widgets')}"
							.value=${this._search}
							@input=${this._handleSearchInput}
						/>
					</div>
				</div>
				<div class="toolbar-field">
					<select
						class="aiux-select aiux-select-md"
						@change=${this._handleFilterChange}
					>
						${FILTER_OPTIONS.map(opt => html`
							<option value=${opt.value} ?selected=${opt.value === this._filter}>${opt.label}</option>
						`)}
					</select>
				</div>
				<div class="toolbar-field">
					<select
						class="aiux-select aiux-select-md"
						@change=${this._handleSortChange}
					>
						${SORT_OPTIONS.map(opt => html`
							<option value=${opt.value} ?selected=${opt.value === this._sort}>${opt.label}</option>
						`)}
					</select>
				</div>
				` : nothing}
				${this.showViewToggle && this._viewTabs && this._viewTabs.length > 0 ? html`
					<aiux-tab-group
						class="view-tabs"
						.tabs=${this._viewTabs}
						active-tab="${this._activeView}"
						variant="boxed"
						size="sm"
						@tab-change=${(e) => this._emit('view-change', { view: e.detail.id })}
					></aiux-tab-group>
				` : nothing}
			</div>
		`;
	}

	/** Type badge — Custom (blue) or ServiceNow (green) */
	_renderBadge(item) {
		const isCustom = item.type === 'custom';
		return html`
			<span class="aiux-badge aiux-badge-soft aiux-badge-xs ${isCustom ? 'aiux-badge-info' : 'aiux-badge-success'} gap-1">
				${isCustom ? this._svgPencil() : this._svgLock()}
				${isCustom ? i18n.getMessage('Custom') : i18n.getMessage('ServiceNow')}
			</span>
		`;
	}

	/** ⋮ context menu — Edit / Clone / Delete */
	_renderCardMenu(item) {
		if (this._openMenuId !== item.id) return nothing;
		const PROTECTED_POLICIES = new Set(['read-only', 'protection']);
		const isProtected = PROTECTED_POLICIES.has(item.sys_policy?.toLowerCase?.()) && !this.isMaintUser;
		return html`
			<ul class="card-menu" role="menu" @click=${e => e.stopPropagation()}>
				${isProtected ? html`
					<li class="card-menu-item" role="menuitem"
						@click=${e => this._handleAction(item, 'edit', e)}>${i18n.getMessage('View')}</li>
				` : html`
					<li class="card-menu-item" role="menuitem"
						@click=${e => this._handleAction(item, 'edit', e)}>${i18n.getMessage('Edit')}</li>
				`}
				<li class="card-menu-item" role="menuitem"
					@click=${e => this._handleAction(item, 'clone', e)}>${i18n.getMessage('Clone')}</li>
				${isProtected ? nothing : html`
					<li class="card-menu-divider" role="separator"></li>
					<li class="card-menu-item card-menu-item--danger" role="menuitem"
						@click=${e => this._handleAction(item, 'delete', e)}>${i18n.getMessage('Delete')}</li>
				`}
			</ul>
		`;
	}

	/** Single card — accepts one item object */
	_renderCard(item) {
		const menuOpen = this._openMenuId === item.id;
		return html`
			<article
				class="card ${menuOpen ? 'card--menu-open' : ''}"
				aria-label="${item.name}"
				@click=${() => this._emit('widget-select', { item })}
			>
				<!-- Top row: badge + ⋮ -->
				<div class="card-top">
					${this._renderBadge(item)}
					<div class="card-menu-wrap">
						<button
							class="dots-btn aiux-tooltip aiux-tooltip-left ${menuOpen ? 'dots-btn--open' : ''}"
							data-tip="${i18n.getMessage('More actions')}"
							aria-label="${i18n.getMessage('Actions for')} ${item.name}"
							aria-haspopup="true"
							aria-expanded="${menuOpen}"
							@click=${e => this._toggleMenu(item.id, e)}
						>${this._svgDots()}</button>
						${this._renderCardMenu(item)}
					</div>
				</div>

				<!-- Body: name + description -->
				<div class="card-body">
					<h3 class="card-name">${item.name}</h3>
					<p class="card-desc">${item.description || i18n.getMessage('No description')}</p>
				</div>

				<!-- Footer: date + created by -->
				<div class="card-footer">
					<div class="card-footer-left">
						${this._svgCalendar()}
						<span class="card-date">${item.date || item.updatedOn || ''}</span>
					</div>
					${item.createdBy ? html`
						<span class="card-author">${item.createdBy}</span>
					` : nothing}
				</div>
			</article>
		`;
	}

	/** Skeleton placeholder card */
	_renderSkeletonCard(index) {
		return html`
			<article class="card skeleton-card" style="animation-delay: ${index * 0.05}s">
				<div class="card-top">
					<span class="skeleton skeleton-badge"></span>
				</div>
				<div class="card-body">
					<div class="skeleton skeleton-title"></div>
					<div class="skeleton skeleton-desc"></div>
					<div class="skeleton skeleton-desc skeleton-desc--short"></div>
				</div>
				<div class="card-footer">
					<div class="skeleton skeleton-date"></div>
				</div>
			</article>
		`;
	}

	/** 3-column responsive card grid */
	_renderGrid() {
		if (this.loading) {
			return html`
				<div class="card-grid" role="list">
					${[0, 1, 2, 3, 4, 5].map(i => this._renderSkeletonCard(i))}
				</div>
			`;
		}
		const visible = this._visibleItems;
		if (visible.length === 0) {
			return html`
				<div class="empty-state">
					<p class="empty-title">${i18n.getMessage('No widgets found')}</p>
					<p class="empty-sub">${i18n.getMessage('Try adjusting your search or filter')}</p>
				</div>
			`;
		}
		return html`
			<div class="card-grid" role="list">
				${visible.map((item, i) => html`
					<div class="card-animate" style="animation-delay: ${i * 0.04}s">
						${this._renderCard(item)}
					</div>
				`)}
			</div>
		`;
	}

	// ─────────────────────────────────────────────────────────────────────
	// Root render
	// ─────────────────────────────────────────────────────────────────────

	render() {
		return html`
			<div class="root">
				${this.hideHeader
					? html`<h2 class="compact-heading">${this.title}</h2>`
					: this._renderHeader()}
				${this._renderToolbar()}
				${this._hideGrid ? html`<slot></slot>` : this._renderGrid()}
				
				<!-- Pagination -->
				${!this._hideGrid && !this.loading && this._filteredItems.length > this._pageSize ? html`
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
		`;
	}

	// ─────────────────────────────────────────────────────────────────────
	// Styles
	// ─────────────────────────────────────────────────────────────────────

	static styles = css`
		:host {
			display: block;
			width: 100%;
			height: 100%;
			font-family: var(--font-sans, Inter);
		}

		/* ── Root ────────────────────────────────────────────────────────── */
		.root {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 6);
			padding: calc(var(--spacing, 0.25rem) * 8) calc(var(--spacing, 0.25rem) * 10);
			min-height: 100%;
			box-sizing: border-box;
		}

		/* ── Header ──────────────────────────────────────────────────────── */
		.section-header {
			display: flex;
			align-items: flex-start;
			justify-content: space-between;
			gap: calc(var(--spacing, 0.25rem) * 4);
			flex-wrap: wrap;
			position: sticky;
			top: 0;
			z-index: 10;
			background: transparent;
			padding: calc(var(--spacing, 0.25rem) * 2.5) 0;
		}

		.header-text {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 1);
		}

		.section-title {
			margin: 0;
			font-size: var(--text-3xl, 1.875rem);
			font-weight: var(--font-weight-normal, 400);
			color: var(--color-base-content, #1f2937);
			line-height: var(--leading-tight, 1.25);
		}

		.section-subtitle {
			margin: 0;
			font-size: var(--text-base, 1rem);
			font-weight: var(--font-weight-normal, 400);
			color: var(--color-base-content-secondary, #6b7280);
		}

		.header-actions {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 3);
		}

		/* ── Toolbar ─────────────────────────────────────────────────────── */
		.toolbar {
			display: flex;
			align-items: flex-end;
			gap: calc(var(--spacing, 0.25rem) * 3);
			flex-wrap: wrap;
		}

		.toolbar-field {
			position: relative;
			flex: 1;
			min-width: 140px;
			max-width: 220px;
		}

		.toolbar-search {
			flex: 1;
			max-width: 280px;
		}
		.search-input-wrap {
			position: relative;
			display: flex;
			align-items: center;
			width: 100%;
		}
		.search-icon {
			position: absolute;
			left: calc(var(--spacing, 0.25rem) * 2.5);
			z-index: 1;
			color: var(--color-base-content-secondary, #6b7280);
			pointer-events: none;
		}
		.search-input {
			padding-left: calc(var(--spacing, 0.25rem) * 8) !important;
			width: 100%;
		}

		/* ── Card grid ───────────────────────────────────────────────────── */
		.card-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: calc(var(--spacing, 0.25rem) * 4);
		}

		@media (max-width: 900px) {
			.card-grid { grid-template-columns: repeat(2, 1fr); }
		}
		@media (max-width: 580px) {
			.card-grid { grid-template-columns: 1fr; }
		}

		/* ── Card ────────────────────────────────────────────────────────── */
		.card {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 2);
			padding: calc(var(--spacing, 0.25rem) * 4);
			background: var(--color-base-100, #ffffff);
			border: 1px solid var(--secondary, #DEE2E9);
			border-radius: var(--radius-xl, 0.75rem);
			cursor: pointer;
			transition: box-shadow 0.15s var(--ease-out, ease), border-color 0.15s var(--ease-out, ease);
			position: relative;
			box-sizing: border-box;
		}
		.card:hover {
			box-shadow: var(--shadow-md, 0 2px 12px rgba(0,0,0,0.08));
			border-color: var(--color-border-default, #9ca3af);
		}
		.card--menu-open {
			z-index: 20;
		}

		/* ── Card top row ────────────────────────────────────────────────── */
		.card-top {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		/* ── Avatar button + User menu ────────────────────────────────────── */
		.avatar-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			background: transparent;
			border: none;
			border-radius: var(--radius-full, 9999px);
			cursor: pointer;
			padding: 0;
			flex-shrink: 0;
		}
		.avatar-btn:focus-visible {
			outline: 2px solid var(--color-primary);
			outline-offset: 2px;
		}
		.user-menu {
			padding: calc(var(--spacing, 0.25rem) * 2);
			background: var(--color-base-100, #ffffff);
			border-radius: var(--radius-xl, 0.75rem);
			border: 1px solid var(--color-base-300, #e5e7eb);
			box-shadow: var(--shadow-lg);
			min-width: 200px;
		}
		#user-submenu:popover-open {
			position: fixed;
			z-index: 9999;
		}
		.user-menu-item {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 2);
			padding: calc(var(--spacing, 0.25rem) * 2.5) calc(var(--spacing, 0.25rem) * 3);
			border-radius: var(--radius-lg, 0.5rem);
			cursor: pointer;
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content, #1e293b);
			border: none;
			background: transparent;
			width: 100%;
			box-sizing: border-box;
		}
		.user-menu-item:hover {
			background: var(--color-base-200, #f3f4f6);
		}
		.user-menu-item .aiux-toggle-sm {
			margin-left: auto;
		}

		/* ── Dots button + card menu ──────────────────────────────────────── */
		.card-menu-wrap { position: relative; }

		.dots-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: calc(var(--spacing, 0.25rem) * 6);
			height: calc(var(--spacing, 0.25rem) * 6);
			border-radius: var(--radius-full, 9999px);
			border: none;
			background: transparent;
			cursor: pointer;
			transition: background 0.12s var(--ease-out, ease);
		}
		.dots-btn:hover     { background: var(--color-base-200, #f3f4f6); }
		.dots-btn--open     { background: var(--color-base-300, #e5e7eb); }
		.dots-btn:focus-visible { outline: 2px solid var(--color-primary, #3b82f6); outline-offset: 1px; }

		.card-menu {
			position: absolute;
			top: calc(var(--spacing, 0.25rem) * 7);
			right: 0;
			width: calc(var(--spacing, 0.25rem) * 30);
			background: var(--color-base-100, #ffffff);
			border: 1px solid var(--color-border-subtle, #e5e7eb);
			border-radius: var(--radius-lg, 0.5rem);
			box-shadow: var(--shadow-lg, 0 4px 16px rgba(0,0,0,0.1));
			padding: calc(var(--spacing, 0.25rem) * 1) 0;
			list-style: none;
			margin: 0;
			z-index: 9999;
		}

		.card-menu-item {
			padding: calc(var(--spacing, 0.25rem) * 1.5) calc(var(--spacing, 0.25rem) * 3);
			font-size: var(--text-xs, 0.75rem);
			color: var(--color-base-content, #1f2937);
			cursor: pointer;
			transition: background 0.1s var(--ease-out, ease);
		}
		.card-menu-item:hover { background: var(--color-base-200, #f3f4f6); }
		.card-menu-item--danger { color: var(--color-error, #ef4444); }
		.card-menu-item--danger:hover { background: color-mix(in srgb, var(--color-error, #ef4444) 10%, transparent); }

		.card-menu-divider {
			height: 1px;
			background: var(--color-border-subtle, #e5e7eb);
			margin: calc(var(--spacing, 0.25rem) * 1) 0;
		}

		/* ── Card body ───────────────────────────────────────────────────── */
		.card-body {
			display: flex;
			flex-direction: column;
			gap: calc(var(--spacing, 0.25rem) * 1);
			flex: 1;
		}

		.card-name {
			margin: 0;
			font-size: var(--text-base, 1rem);
			font-weight: var(--font-weight-semibold, 600);
			color: var(--color-base-content, #1f2937);
			line-height: var(--leading-snug, 1.375);
			/* clamp to 1 line */
			display: -webkit-box;
			-webkit-line-clamp: 1;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.card-desc {
			margin: 0;
			font-size: var(--text-sm, 0.875rem);
			color: var(--color-base-content-secondary, #6b7280);
			line-height: var(--leading-normal, 1.5);
			min-height: 42px; /* reserve 2 lines: 14px × 1.5 × 2 */
			/* clamp to 2 lines */
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		/* ── Card footer ─────────────────────────────────────────────────── */
		.card-footer {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: calc(var(--spacing, 0.25rem) * 2);
		}

		.card-footer-left {
			display: flex;
			align-items: center;
			gap: calc(var(--spacing, 0.25rem) * 1.5);
		}

		.card-date {
			font-size: var(--text-xs, 0.75rem);
			color: var(--color-base-content-secondary, #6b7280);
		}

		.card-author {
			font-size: var(--text-2xs, 0.6875rem);
			color: var(--color-base-400, #9ca3af);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: calc(var(--spacing, 0.25rem) * 30);
		}

		/* ── Compact heading (when hideHeader) ───────────────────────────── */
		.compact-heading {
			margin: 0;
			font-size: var(--text-lg, 1.125rem);
			font-weight: var(--font-weight-medium, 500);
			color: var(--color-base-content, #1f2937);
			animation: fadeInUp 0.5s var(--ease-out, ease) both;
		}

		/* ── Pagination ──────────────────────────────────────────────────── */
		.pagination-container {
			display: flex;
			justify-content: center;
			padding: calc(var(--spacing, 0.25rem) * 6) 0;
			margin-top: auto;
		}

		/* ── Empty state ─────────────────────────────────────────────────── */
		.empty-state {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: calc(var(--spacing, 0.25rem) * 16) calc(var(--spacing, 0.25rem) * 6);
			gap: calc(var(--spacing, 0.25rem) * 2);
			text-align: center;
		}

		.empty-title { margin: 0; font-size: var(--text-base, 1rem); font-weight: var(--font-weight-semibold, 600); color: var(--color-base-content, #1f2937); }
		.empty-sub   { margin: 0; font-size: var(--text-sm, 0.875rem); color: var(--color-base-content-secondary, #6b7280); }

		/* ── Entrance animations ─────────────────────────────────────────── */
		@keyframes fadeInUp {
			from { opacity: 0; transform: translateY(16px); }
			to   { opacity: 1; transform: translateY(0); }
		}

		@keyframes shimmer {
			0%   { background-position: -200% 0; }
			100% { background-position: 200% 0; }
		}

		.section-header {
			animation: fadeInUp 0.5s var(--ease-out, ease) both;
		}

		.toolbar {
			animation: fadeInUp 0.5s var(--ease-out, ease) 0.1s both;
		}

		.card-animate {
			animation: fadeInUp 0.4s var(--ease-out, ease) both;
		}

		/* ── Skeleton cards ──────────────────────────────────────────────── */
		.skeleton-card {
			pointer-events: none;
			animation: fadeInUp 0.4s var(--ease-out, ease) both;
		}

		.skeleton {
			background: linear-gradient(90deg, var(--color-base-200, #f3f4f6) 25%, var(--color-base-300, #e5e7eb) 50%, var(--color-base-200, #f3f4f6) 75%);
			background-size: 200% 100%;
			animation: shimmer 1.5s infinite var(--ease-in-out, ease-in-out);
			border-radius: var(--radius-md, 0.375rem);
		}

		.skeleton-badge {
			width: calc(var(--spacing, 0.25rem) * 18);
			height: calc(var(--spacing, 0.25rem) * 5);
			border-radius: var(--radius-full, 9999px);
		}

		.skeleton-title {
			width: 65%;
			height: calc(var(--spacing, 0.25rem) * 4.5);
			margin-bottom: calc(var(--spacing, 0.25rem) * 1);
		}

		.skeleton-desc {
			width: 90%;
			height: calc(var(--spacing, 0.25rem) * 3.5);
		}

		.skeleton-desc--short {
			width: 55%;
		}

		.skeleton-date {
			width: calc(var(--spacing, 0.25rem) * 20);
			height: calc(var(--spacing, 0.25rem) * 3);
		}

		/* ── Reduced motion ──────────────────────────────────────────────── */
		.icon-on-primary { color: var(--color-primary-content, #ffffff); }
		.icon-search { color: var(--color-base-content-secondary, #64748b); }
		.icon-muted { color: var(--color-base-400, #92918f); }
		.icon-action-edit { color: var(--color-info, #2a6edc); }
		.icon-action-lock { color: var(--color-success, #52cb3d); }
		.icon-secondary { color: var(--color-base-content-secondary, #656462); }

		.view-tabs { margin-left: auto; }

		@media (prefers-reduced-motion: reduce) {
			.card, .dots-btn,
			.toolbar-select-btn, .dropdown-item, .card-menu-item { transition: none; }
			.section-header, .toolbar, .card-animate, .skeleton-card { animation: none; }
			.skeleton { animation: none; background: var(--color-base-200, #f3f4f6); }
		}

	`;
}
