function repairChecked() {
	ScriptLoader.getScripts([ '/scripts/SLARepairClient16.js' ], function() {
		var slaClient = new SLARepairClient();
		var tableName = g_list.getTableName();
		var list = GlideList.get(tableName);
		slaClient.callback = function() {
			list.refreshWithOrderBy();
		};
		slaClient.repairBySysId(tableName, list.getChecked());
	});
}
