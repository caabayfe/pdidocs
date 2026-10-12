var ScopeQueryCondition = Class.create();
ScopeQueryCondition.prototype = {
    initialize: function(/*ScopeGlideRecordExecutor*/ scopeGlideRecordExecutor, /*number*/ parentConditionId) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		this._scopeGlideRecordExecutor = scopeGlideRecordExecutor;
		this._parentConditionId = parentConditionId;
		this._SYSTEM_COLUMN_MAP = {
			id: 'sys_id',
			created: 'sys_created_on',
			createdBy: 'sys_created_by',
			created_by: 'sys_created_by',
			updated: 'sys_updated_on',
			updatedBy: 'sys_updated_by',
			updated_by: 'sys_updated_by'
		};
	},

	_columnName: function(name) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		var mappedName = this._SYSTEM_COLUMN_MAP[name];
		if (typeof mappedName !== 'undefined')
			return mappedName;

		return name;
	},
	
	addCondition: function(field, operator, value) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		field = this._columnName(field);
		if (typeof value === 'undefined')
			value = null;

		return this._scopeGlideRecordExecutor._addCondition(field, operator, value, this._parentConditionId, false);
	},

	addOrCondition: function(field, operator, value) {
		if (gs.getCallerScopeName() != "sn_atf_tg")
			return;

		field = this._columnName(field);
		if (typeof value === 'undefined')
			value = null;

		return this._scopeGlideRecordExecutor._addCondition(field, operator, value, this._parentConditionId, true);
	},

    type: 'ScopeQueryCondition'
};
