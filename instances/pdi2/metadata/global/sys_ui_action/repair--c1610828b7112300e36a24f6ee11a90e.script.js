ScriptLoader.getScripts([ '/scripts/SLARepairClient.js' ], function() {});

function repairAllOfflineUpdateSLA() {
    var slaClient = new SLARepairClient();
    var tableName = g_list.getTableName();
    slaClient.callback = function() {
        GlideList2.get(tableName).refreshWithOrderBy();
    };
    slaClient.repairByTableName(tableName);
}
