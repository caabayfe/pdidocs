var AutoResolutionRefQualifier = Class.create();
AutoResolutionRefQualifier.prototype = {
    initialize: function() {
    },
	
	getActiveConfigurations: function(currentAutoResConfigSysID) {
		var activeConfigSysIDList = [];
		var languageConfigGr = new GlideAggregate(AutoResolutionConstants.CONFIG_LANGUAGE_TABLE_NAME);
		languageConfigGr.addActiveQuery();
		languageConfigGr.addQuery("configuration.sys_id", "!=", currentAutoResConfigSysID);
		languageConfigGr.addQuery("configuration.target_table_name", "incident");
		languageConfigGr.groupBy("configuration");
		languageConfigGr.query();
		while(languageConfigGr.next()) {
			var sysId = languageConfigGr.getValue("configuration");
			activeConfigSysIDList.push(sysId);
		}
		return 'sys_idIN' + activeConfigSysIDList.join(',');
	},

	getTemplates: function(tableName) {
		return 'global=true^table=' + tableName;
	},

    type: 'AutoResolutionRefQualifier'
};
