var OneAPIFeatureProviderRefQualUtils = Class.create();
OneAPIFeatureProviderRefQualUtils.prototype = {
    initialize: function() {
		this._FDIH_ACTION_TABLE = 'sys_hub_action_type_definition';
		this._FDIH_SUBFLOW_TABLE = 'sys_hub_flow';
		this._SYS_SCRIPT_INCLUDE = 'sys_script_include';
		this._SYS_SERVICE_PLAN_TABLE = 'one_api_service_plan';
	},

    getRefQualForDocumentId: function(current) {
        if (current && 'FDIH Action' == current.type) {
            return 'sys_idIN' + this._getSysIds(this._FDIH_ACTION_TABLE);
        } else if (current && 'FDIH Subflow' == current.type) {
            return 'sys_idIN' + this._getSysIds(this._FDIH_SUBFLOW_TABLE);
        } else if (current && 'script' == current.type) {
			return 'sys_idIN' + this._getSysIds(this._SYS_SCRIPT_INCLUDE);
		} else if (current && 'Service Plan' == current.type) {
			return 'sys_idIN' + this._getSysIds(this._SYS_SERVICE_PLAN_TABLE);
		}
        return 'sys_idIN' +
            this._getSysIds(this._FDIH_ACTION_TABLE) +
			this._getSysIds(this._SYS_SCRIPT_INCLUDE) +
            this._getSysIds(this._FDIH_SUBFLOW_TABLE) +
			this._getSysIds(this._SYS_SERVICE_PLAN_TABLE);
    },

    _getSysIds: function(tableName) {
        var gr = new GlideRecord(tableName);
        gr.addActiveQuery();
        gr.query();
        var ids = [];
        while (gr.next()) {
            ids.push(new String(gr.sys_id));
        }
        return ids;
    },

    type: 'OneAPIFeatureProviderRefQualUtils'
};
