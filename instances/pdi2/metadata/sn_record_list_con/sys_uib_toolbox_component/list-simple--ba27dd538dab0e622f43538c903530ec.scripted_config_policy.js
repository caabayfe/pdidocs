// This file sets logical behavior for the NRLC config panel in UIB
// e.g. disabling properties that depending on other props, etc

// eslint-disable-next-line no-unused-vars
function recordListConnectedPolicy({api, trigger, properties}) {
	const p = {
		ACTION_CONFIG_ID: 'actionConfigId',
		COLUMN_PREFERENCE_KEY: 'columnPreferenceKey',
		COLUMNS: 'columns',
		DA_CLIENT_ACTION_CONTRACT: 'daClientActionContract',
		ERROR: 'error',
		FIXED_QUERY: 'fixedQuery',
		GROUP_BY_FIELD: 'groupByField',
		HEADER_SIZE: 'headerSize',
		HEADING_LEVEL: 'headingLevel',
		HIDE_CELL_FILTER: 'hideCellFilter',
		HIDE_CHECKBOX_HOVER: 'hideCheckboxHover',
		HIDE_COLUMN_FILTERING: 'hideColumnFiltering',
		HIDE_COLUMN_GROUPING: 'hideColumnGrouping',
		HIDE_COLUMN_REORDER: 'hideColumnReorder',
		HIDE_COLUMN_RESIZING: 'hideColumnResizing',
		HIDE_COLUMN_SORTING: 'hideColumnSorting',
		HIDE_DECLARATIVE_ACTIONS: 'hideDeclarativeActions',
		HIDE_DOTWALK: 'hideDotwalk',
		HIDE_DRAG_DROP: 'hideDragDrop',
		ALL_RECORDS_SELECTED: 'allRecordsSelected',
		HIDE_EMPTY_STATE_IMAGE: 'hideEmptyStateImage',
		HIDE_FILTER_PANEL: 'hideFilterPanel',
		HIDE_FIRST_PAGE: 'hideFirstPage',
		HIDE_HEADER: 'hideHeader',
		HIDE_HIGHLIGHTED_VALUES: 'hideHighlightedValues',
		HIDE_HIGHLIGHT_CONTENT: 'hideHighlightContent',
		HIDE_INLINE_EDITING: 'hideInlineEditing',
		HIDE_LAST_PAGE: 'hideLastPage',
		HIDE_LAST_REFRESHED_TEXT: 'hideLastRefreshedText',
		HIDE_LIMIT_SELECTOR: 'hideLimitSelector',
		HIDE_LINKS: 'hideLinks',
		HIDE_LIST_SHARING: 'hideListSharing',
		HIDE_MENU_BUTTON: 'hideMenuButton',
		HIDE_NEXT_PAGE: 'hideNextPage',
		HIDE_OPTION_TO_SAVE_AS: 'hideOptionToSaveAs',
		HIDE_PAGES: 'hidePages',
		HIDE_PAGINATION: 'hidePagination',
		HIDE_PANEL_ADVANCED: 'hidePanelAdvanced',
		HIDE_PANEL_CONDITION_DELETE: 'hidePanelConditionDelete',
		HIDE_PANEL_FOOTER: 'hidePanelFooter',
		HIDE_PANEL_RESTORE: 'hidePanelRestore',
		HIDE_PERSONALIZATION: 'hidePersonalization',
		HIDE_PREVIOUS_PAGE: 'hidePreviousPage',
		HIDE_QUICK_EDIT: 'hideQuickEdit',
		HIDE_RANGE: 'hideRange',
		HIDE_REFRESH_BUTTON: 'hideRefreshButton',
		HIDE_ROW_COUNT: 'hideRowCount',
		HIDE_ROW_SELECTOR: 'hideRowSelector',
		HIDE_SELECT_ALL: 'hideSelectAll',
		HIDE_TITLE: 'hideTitle',
		HIDE_TITLE_ROW_COUNT: 'hideTitleRowCount',
		HIDE_UNNECESSARY_ROW_SELECTORS: 'hideUnnecessaryRowSelectors',
		HIDE_VIEW_ALL: 'hideViewAll',
		HIGHLIGHTED_VALUE_CONFIG_ID: 'highlightedValueConfigId',
		HIGHLIGHT_CONTENT: 'highlightContent',
		IS_REF_LIST: 'isRefList',
		IS_PARENT_READ_ONLY: 'isParentReadOnly',
		IS_PARENT_NEW_RECORD: 'isParentNewRecord',
		LANDMARK: 'nrlLandmark',
		LIMIT: 'limit',
		LIST_MENU_OPEN: 'listMenuOpen',
		LIST_TITLE: 'listTitle',
		MAX_CHAR_LIMIT: 'maxCharLimit',
		MAX_COLUMNS: 'maxColumns',
		MENU_SELECTION: 'menuSelection',
		OVERRIDE_WORD_WRAP_USER_PREF: 'overrideWordWrapUserPref',
		PAGE: 'page',
		PARENT_RECORD_SYS_ID: 'parentRecordSysId',
		PARENT_TABLE: 'parentTable',
		QUERY: 'query',
		FOLLOW_FILTERS: 'followFilters',
		IS_DASHBOARD: 'isDashboard',
		RECORD_SELECTED_QUERY: 'recordSelectedQuery',
		RECORD_SELECTED_SYS_ID: 'recordSelectedSysId',
		RECORD_SELECTED_TABLE: 'recordSelectedTable',
		RECORD_SELECTED_VIEW: 'recordSelectedView',
		REFRESH_REQUESTED_PROP: 'refreshRequested',
		RELATED_LIST_NAME: 'relatedListName',
		SELECTED_LIST_ID: 'selectedListId',
		SELECTED_RECORDS: 'selectedRecords',
		EXCEPTED_RECORDS: 'exceptedRecords',
		TABLE: 'table',
		TINY: 'tiny',
		VIEW: 'view',
		WORD_WRAP: 'wordWrap',
		BARE: 'bare',
		SHOW_BORDER: 'showBorder'
	};

	// Default display

	if (trigger === p.VIEW) {
		api.updateEnabled(p.COLUMNS, !properties.view);
	}

	if (trigger === p.COLUMNS) {
		api.updateEnabled(p.VIEW, !properties.columns);
	}

	if (trigger === p.HIDE_HIGHLIGHTED_VALUES) {
		api.updateEnabled(
			p.HIGHLIGHTED_VALUE_CONFIG_ID,
			!properties.hideHighlightedValues
		);
	}

	if (trigger === p.HIDE_HIGHLIGHT_CONTENT) {
		api.updateEnabled(p.HIGHLIGHT_CONTENT, !properties.hideHighlightContent);
	}

	if (trigger === p.HIDE_LINKS) {
		api.updateEnabled(p.IS_REF_LIST, !properties.hideLinks);
	}

	if (trigger === p.WORD_WRAP) {
		api.updateEnabled(p.MAX_CHAR_LIMIT, properties.wordWrap);
	}

	// End user permissions

	if (trigger === p.HIDE_ROW_SELECTOR) {
		const hideRowSelectorDependencies = [
			p.HIDE_SELECT_ALL,
			p.HIDE_CHECKBOX_HOVER,
			p.HIDE_UNNECESSARY_ROW_SELECTORS
		];
		hideRowSelectorDependencies.map(propName => {
			api.updateVisibility(propName, !properties.hideRowSelector);
		});
	}

	// Header
	const hideHeaderDependencies = [
		p.HEADER_SIZE,
		p.HIDE_TITLE,
		p.LIST_TITLE,
		p.HEADING_LEVEL,
		p.HIDE_TITLE_ROW_COUNT,
		p.HIDE_LAST_REFRESHED_TEXT,
		p.HIDE_DECLARATIVE_ACTIONS,
		p.ACTION_CONFIG_ID,
		p.HIDE_REFRESH_BUTTON,
		p.HIDE_OPTION_TO_SAVE_AS,
		p.HIDE_LIST_SHARING,
		p.HIDE_FILTER_PANEL,
		p.HIDE_PANEL_FOOTER,
		p.HIDE_PANEL_RESTORE,
		p.HIDE_PANEL_ADVANCED,
		p.HIDE_PANEL_CONDITION_DELETE
	];

	hideHeaderDependencies.map(propName => {
		api.updateVisibility(propName, !properties.hideHeader);
	});

	if (trigger === p.HIDE_TITLE) {
		api.updateEnabled(p.LIST_TITLE, !properties.hideTitle);
		api.updateEnabled(p.HEADING_LEVEL, !properties.hideTitle);
	}

	if (trigger === p.HIDE_DECLARATIVE_ACTIONS) {
		api.updateEnabled(p.ACTION_CONFIG_ID, !properties.hideDeclarativeActions);
	}

	// Pagination
	const hidePaginationDependencies = [
		p.HIDE_RANGE,
		p.HIDE_ROW_COUNT,
		p.PAGE,
		p.HIDE_PAGES,
		p.HIDE_FIRST_PAGE,
		p.HIDE_PREVIOUS_PAGE,
		p.HIDE_NEXT_PAGE,
		p.HIDE_LAST_PAGE,
		p.HIDE_LIMIT_SELECTOR,
		p.LIMIT
	];
	hidePaginationDependencies.map(propName => {
		api.updateVisibility(propName, !properties.hidePagination);
	});

	// Advanced
	if (trigger === p.MENU_SELECTION) {
		api.updateEnabled(p.HIDE_MENU_BUTTON, properties.menuSelection);
		api.updateEnabled(p.LIST_MENU_OPEN, properties.menuSelection);
	}

	if (trigger === p.HIDE_MENU_BUTTON) {
		api.updateEnabled(p.LIST_MENU_OPEN, !properties.hideMenuButton);
	}

	/* dashboard specific properties should only be visible when isDashboard is true, 
	isDashboard property is set true in PAR dashboard config panel
	*/
	if (api && properties && trigger === null) {
		api.updateSectionVisibility('borderAndSpacing', properties.isDashboard);
		api.updateVisibility(p.FOLLOW_FILTERS, properties.isDashboard);
	}

	// Border and spacing
	api.updateVisibility(p.BARE, !properties.showBorder);
	if (properties.showBorder) {
		api.updateValue(p.BARE, false);
	}
}
