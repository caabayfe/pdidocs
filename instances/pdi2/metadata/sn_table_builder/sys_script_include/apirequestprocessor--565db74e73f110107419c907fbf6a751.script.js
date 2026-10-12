var APIRequestProcessor = Class.create();

APIRequestProcessor.REQUEST_TABLE_STRUCTURE_DATA = 'req-table-structure-data';
APIRequestProcessor.REQUEST_TABLE_PROPERTIES = 'req-table-properties';
APIRequestProcessor.VALIDATE_FIELD_VALUES = 'validate-field-values';
APIRequestProcessor.DELETE_TABLE_RECORDS = 'del-table-records';
APIRequestProcessor.REQUEST_TABLE_EXTENSIONS = 'req-table-extensions';
APIRequestProcessor.REQUEST_FLOW_LIST = 'req-flow-list';

APIRequestProcessor.prototype = {
	initialize(action, options) {
		this.action = action;
		this.options = options;
		this.options.sysId = TBUtil.getValidTableId(this.options.sysId);
	},

	build() {
		switch (this.action) {
			case APIRequestProcessor.REQUEST_TABLE_STRUCTURE_DATA:
				return this._buildTableStructureData();
			case APIRequestProcessor.REQUEST_TABLE_PROPERTIES:
				return this._buildTableProperties();
			case APIRequestProcessor.VALIDATE_FIELD_VALUES:
				return this._validateFieldValues();
			case APIRequestProcessor.DELETE_TABLE_RECORDS:
				return this._deleteTableRecords();
			case APIRequestProcessor.REQUEST_TABLE_EXTENSIONS:
				return this._buildTableExtensions();
			case APIRequestProcessor.REQUEST_FLOW_LIST:
				return this._buildFlowList();
			default:
				return gs.getMessage('No action requested');
		}
	},

	_buildTableStructureData() {
		return new TBTableStructureAPI(
			this.options.sysId,
			this.options.perspective,
			{
				transactionScope:
					this.options.sysparm_transaction_scope ||
					TBConstants.DEFAULT_SCOPE,
			}
		).build();
	},

	_buildTableProperties() {
		return new TBTablePropertiesAPI(this.options.sysId).build();
	},

	_validateFieldValues() {
		return new TBFieldValidationAPI(
			this.options.table,
			this.options.payload
		).build();
	},

	_deleteTableRecords() {
		return new TBDeleteRecords(this.options.table).build();
	},

	_buildTableExtensions() {
		return new TBTableExtensionsAPI(this.options.table).build();
	},

	_buildFlowList() {
		return new FlowDataAPI({
			tableName: this.options.tableName,
			query: this.options.query,
			orderByColumn: this.options.orderByColumn,
			orderByIsDescending: this.options.orderByIsDescending,
		}).build();
	},

	type: 'APIRequestProcessor',
};
