function mergeFormUpgrade() {
	openMergeForm();
	sendUsageAnalyticsEvent();
}

function openMergeForm() {
	if (typeof rowSysId == 'undefined')
        sysId = gel('sys_uniqueValue').value;
    else
        sysId = rowSysId;

    var idAjax = new GlideAjax("UpgradeHistoryTaskUtil");
    idAjax.addParam("sysparm_name", "getHistoryLogId");
    idAjax.addParam("historyTaskId", sysId);
    idAjax.getXMLAnswer(runScriptLoader);
}

function runScriptLoader(answer) {
    var response = JSON.parse(answer);

    ScriptLoader.getScripts('/script/RecordPayloadUtil.js', function() {
        var url = new GlideURL("merge_form_upgrade.do");
        url.addParam("sysparm_upgrade_history_log_id", response.historyLogId);
        url.addParam("sysparm_stack", "merge_form_close.do");
        url.addParam("sysparm_nameofstack", "merge_form");

        g_navigation.openPopup(url.getURL());
    });
}

function sendUsageAnalyticsEvent() {
	var idAjax = new GlideAjax("UpgradeCenterGCFAnalyticsAjax");
	idAjax.addParam('sysparm_name', 'sendUsageAnalyticsEvent');
	idAjax.addParam('sysparm_category', 'custom_metric');
	idAjax.addParam('sysparm_point', 'upgrade_summary_task');
	idAjax.addParam('sysparm_event', 'button_click');
	idAjax.addParam('sysparm_sampleMap', '{"button":"resolve_conflict"}');
	idAjax.getXMLAnswer();
}
