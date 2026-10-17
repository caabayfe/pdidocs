var TBTableStructureAPI = Class.create();
TBTableStructureAPI.prototype = {
	/**
	 * options - { transactionScope }
	 */
	initialize(sysId, perspective, options) {
		this.sysId = sysId;
		this.perspective = perspective;
		this.tbObj = new TableDBObject(sysId);
		this.table = this.tbObj.getName();
		this.options = options;
	},

	build() {
		var result = this._validate();

		if (!result.isValid) return TBUtil.error(result);

		switch (this.perspective) {
			case TBConstants.TB_PERSPECTIVES.VIEW_FIELD_ROW:
				return this._fieldRowPerspective();
			default:
				return {};
		}
	},

	_fieldRowPerspective() {
		this.prefManager = new PreferenceManager(
			TBConstants.SYS_CLASS_DICTIONARY
		);
		var tableMetadata = this.tbObj.tableMetadata(
			this.options.transactionScope
		);
		var columns = new TableColumns(
			TBConstants.SYS_CLASS_DICTIONARY,
			TBConstants.fieldRowListView
		).getColumnProps();
		var pref = new PreferenceManager();
		var orderByColumn = this._getSortColumn();
		var orderByIsDescending = this._isSortOrderDescending();
		var rowCount = this._getRowCount();
		var choiceTypes = TBUtil.getChoiceTypes();
		var readOnlyOptionValues = TBUtil.getReadOnlyOptionChoiceValues();

		return {
			tableMetadata,
			columns,
			preferenceData: {
				showWelcomeScreen: !JSON.parse(
					pref.getWelcomeScreenPreference()
				),
				showDataTabInfoPopup: !JSON.parse(
					pref.getDataTabInfoPopupPreference()
				),
			},
			pageSize: rowCount,
			orderByColumn,
			choiceTypes,
			readOnlyOptionValues,
			orderByIsDescending,
		};
	},
	_getRowCount() {
		return JSON.parse(this.prefManager.getRowCount());
	},

	_getSortColumn() {
		var defaultColumnForSort = this._getDefaultColumnForSort(
			TBConstants.SYS_CLASS_DICTIONARY,
			TBConstants.fieldRowListView
		);
		return this.prefManager.getSortColumn(defaultColumnForSort);
	},

	_isSortOrderDescending() {
		return this.prefManager.isOrderByDescending();
	},

	_getDefaultColumnForSort(table, view) {
		var columns = new ListViewManager(table, view).getListElements();
		return columns && columns.length ? columns[0] : null;
	},

	_validate() {
		var res = Validators.validatePerspective(this.perspective);
		if (!res.isValid) return res;

		res = Validators.validateTbObjRecord(this.tbObj);
		if (!res.isValid) return res;

		res = Validators.validateTbObjAccess(this.tbObj);
		if (!res.isValid) return res;

		return {
			isValid: true,
		};
	},

	type: 'TBTableStructureAPI',
};
