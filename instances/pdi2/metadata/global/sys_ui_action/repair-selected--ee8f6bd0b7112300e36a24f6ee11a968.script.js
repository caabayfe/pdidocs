ScriptLoader.getScripts([ '/scripts/SLARepairClient.js' ], function() {});

function repairOfflineUpdateSLA() {
    var slaClient = new SLARepairClient();
    var tableName = g_list.getTableName();
    slaClient.callback = function() {
        GlideList2.get(tableName).refreshWithOrderBy();
    };
    slaClient.repairBySysId(tableName, g_list.getChecked());
}
