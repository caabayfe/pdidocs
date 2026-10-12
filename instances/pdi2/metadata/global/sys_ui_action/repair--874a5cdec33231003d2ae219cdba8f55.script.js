ScriptLoader.getScripts([ '/scripts/SLARepairClient.js' ], function() {});
function repair() {
    var slaClient = new SLARepairClient();
    slaClient.callback = function(response) {
        var query = encodeURIComponent("sla="+g_form.getValue("sla") + "^task=" + g_form.getValue("task"));
        window.location = "/task_sla_list.do?sysparm_query=" + query;
    };
    slaClient.repairBySysId(g_form.getTableName(), g_form.getUniqueValue());
}
