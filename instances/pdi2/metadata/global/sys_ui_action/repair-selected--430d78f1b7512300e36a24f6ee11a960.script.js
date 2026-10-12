function repairOfflineUpdateSLA() {
	ScriptLoader.getScripts([ '/scripts/SLARepairClient16.js' ], function() {
		var slaClient = new SLARepairClient();
		var tableName = g_list.getTableName();
		slaClient.callback = function() {
			g_list.refreshWithOrderBy(); 
		};
		slaClient.repairBySysId(tableName, g_list.getChecked());
	});
}
