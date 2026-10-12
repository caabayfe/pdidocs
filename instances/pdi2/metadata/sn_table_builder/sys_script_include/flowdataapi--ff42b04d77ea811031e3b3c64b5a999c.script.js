var FlowDataAPI = Class.create();

FlowDataAPI.DEFAULT_SORT_COLUMN = 'sys_updated_on';
FlowDataAPI.DEFAULT_ORDER_BY_IS_DESCENDING = true;
FlowDataAPI.prototype = {
	/**
	 * options - { tableName }
	 */
	initialize(options) {
		this.tableName = options.tableName || '';
		this.query = (options && options.query) || '';
		this.orderByColumn = options && options.orderByColumn;
		this.orderByIsDescending = options && options.orderByIsDescending;
	},

	build() {
		var result = this._validate();

		if (!result.isValid) return TBUtil.error(result);

		var orderByColumn = this._getSortColumn();
		var orderByIsDescending = this._isSortOrderDescending();
		var sortQuery = this._getSortQuery(orderByColumn, orderByIsDescending);

		var flows = new FlowRecords({
			tableName: this.tableName,
			query: this.query,
			sortQuery,
		}).getRecordDetails();
		return {
			tableName: this.tableName,
			flows: flows.rows,
			canCreate: flows.canCreate,
		};
	},

	_getSortColumn() {
		return this.orderByColumn || FlowDataAPI.DEFAULT_SORT_COLUMN;
	},

	_isSortOrderDescending() {
		return typeof this.orderByIsDescending !== 'undefined'
			? JSON.parse(this.orderByIsDescending)
			: FlowDataAPI.DEFAULT_ORDER_BY_IS_DESCENDING;
	},

	_getSortQuery(orderByColumn, orderByIsDescending) {
		return (
			(orderByIsDescending ? 'ORDERBYDESC' : 'ORDERBY') + orderByColumn
		);
	},

	_validate() {
		var res = Validators.isValidTableRecord(this.tableName);
		if (!res.isValid) {
			res.message = gs.getMessage(
				'Invalid Table Name passed in API request'
			);
			return res;
		}

		return {
			isValid: true,
		};
	},

	type: 'FlowDataAPI',
};
