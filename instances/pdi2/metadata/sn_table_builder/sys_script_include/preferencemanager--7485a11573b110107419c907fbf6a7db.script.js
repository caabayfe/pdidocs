var PreferenceManager = Class.create();

PreferenceManager.BASE_SORT_DIRECTION_KEY = '.table_builder.order.direction';
PreferenceManager.BASE_SORT_COLUMN_KEY = '.table_builder.order';
PreferenceManager.DEFAULT_DIRECTION = 'ASC';
PreferenceManager.DEFAULT_COLUMN = 'sys_updated_on';
PreferenceManager.DEFAULT_ROWCOUNT = 20;
PreferenceManager.ROW_COUNT_KEY = 'table_builder.rowcount';
PreferenceManager.WELCOME_SCREEN_KEY = 'table_builder.dont.show.welcome.screen';
PreferenceManager.DEFAULT_WELCOME_SCREEN_KEY = false;
PreferenceManager.DATA_TAB_INFO_POPUP_PREFERENCE_KEY =
	'table_builder.dont.show.data.tab.info.popover';
PreferenceManager.DEFAULT_DATA_TAB_INFO_POPUP_PREFERENCE_KEY = false;

PreferenceManager.prototype = {
	initialize(table) {
		this.table = table;
	},

	getSortDirection() {
		var prefKey = this.table + PreferenceManager.BASE_SORT_DIRECTION_KEY;
		return (
			gs.getUser().getPreference(prefKey) ||
			PreferenceManager.DEFAULT_DIRECTION
		);
	},

	getSortColumn(defaultColumnForSort) {
		var prefKey = this.table + PreferenceManager.BASE_SORT_COLUMN_KEY;
		var prefValue = gs.getUser().getPreference(prefKey);

		// if there is no preference value, save default column as sort column in preferences
		if (defaultColumnForSort && !prefValue)
			gs.getUser().savePreference(prefKey, defaultColumnForSort);

		return (
			gs.getUser().getPreference(prefKey) ||
			PreferenceManager.DEFAULT_COLUMN
		);
	},

	getRowCount() {
		var rowCountValue = gs
			.getUser()
			.getPreference(PreferenceManager.ROW_COUNT_KEY);

		if (gs.nil(rowCountValue))
			gs.getUser().savePreference(
				PreferenceManager.ROW_COUNT_KEY,
				PreferenceManager.DEFAULT_ROWCOUNT
			);

		return gs.getUser().getPreference(PreferenceManager.ROW_COUNT_KEY);
	},

	isOrderByDescending() {
		return this.getSortDirection() === 'DESC';
	},

	getCurrentSortQuery() {
		var sortCmd = this.isOrderByDescending() ? 'ORDERBYDESC' : 'ORDERBY';
		return sortCmd + this.getSortColumn();
	},

	getWelcomeScreenPreference() {
		return (
			gs.getUser().getPreference(PreferenceManager.WELCOME_SCREEN_KEY) ||
			PreferenceManager.DEFAULT_WELCOME_SCREEN_KEY
		);
	},

	getDataTabInfoPopupPreference() {
		return (
			gs
				.getUser()
				.getPreference(
					PreferenceManager.DATA_TAB_INFO_POPUP_PREFERENCE_KEY
				) ||
			PreferenceManager.DEFAULT_DATA_TAB_INFO_POPUP_PREFERENCE_KEY
		);
	},

	type: 'PreferenceManager',
};
