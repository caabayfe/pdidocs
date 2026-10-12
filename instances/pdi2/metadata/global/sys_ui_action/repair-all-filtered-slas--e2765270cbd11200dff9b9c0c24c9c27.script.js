function repairFiltered() {
    ScriptLoader.getScripts([ '/script/SLARepairClient16.js' ], function() {
        var slaClient = new SLARepairClient();
        var tableName = g_list.getTableName();
        var list = GlideList.get(tableName);
		
		if (list.getRowCount() == 0){
			alert(g_i18n.getMessage("There are no records to repair"));
			return;
		}
		
        slaClient.callback = function() {
            list.refreshWithOrderBy();
        };
        slaClient.repairByFilter(tableName, list.getQuery());
    });
}
