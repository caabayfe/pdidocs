var CMDBSraUtil = Class.create();
CMDBSraUtil.prototype = {
	initialize: function() {},

	remediateByRefresh: function(ciSysIdList) {
		if (!ciSysIdList || !Array.isArray(ciSysIdList) || ciSysIdList.length == 0) {
			return false;
		}

		var configuredTimestamp = gs.getProperty("sn_cmdb_gen_ai.staleness_timestamp_field", "sys_updated_on");
		var refreshedTimestamp = new GlideDateTime();

		var gr = new GlideRecordSecure("cmdb_ci");
		if (!gr.isValidField(configuredTimestamp)) {
			gs.error("Invalid staleness refresh field configured: " + configuredTimestamp);
			return false;
		}
		var fieldType = gr.getElement(configuredTimestamp).getED().getInternalType();
		if (fieldType != "glide_date_time") {
			gs.error("Staleness refresh field must be a glide_date_time column, got '" + fieldType
				+ "' for field: " + configuredTimestamp);
			return false;
		}
		gr.addQuery("sys_id", 'IN', ciSysIdList);
		gr.setValue(configuredTimestamp, refreshedTimestamp);
		gr.autoSysFields(false);
		gr.setWorkflow(false);
		gr.setForceUpdate(true);
		gr.setRunEngines(false);
		gr.query();
		gr.updateMultiple();
		return true;
	},

	type: 'CMDBSraUtil'
};
