var allowedToShow = GlideLists2 && Object.keys(GlideLists2).length === 1;
if (!allowedToShow) {
	var restoreMatchingConditionLink = getTopWindow().document.getElementById('69e79678b7493210da703ca0ae11a980')
	if (restoreMatchingConditionLink)
		restoreMatchingConditionLink.hide();
}

function restoreMatchingConditions() {
    var tableName = Object.keys(GlideLists2)[0];
    var g_list = GlideLists2[tableName];
	var query = g_list.getQuery();
    var ga = new GlideAjax('BulkRestoreRequester');
    ga.addParam('sysparm_archive_table', g_list.tableName);
    ga.addParam('sysparm_condition', query);
    ga.addParam('sysparm_name', 'scheduleRestore');
    ga.getXMLAnswer(bulkRestoreResponse);
}

function bulkRestoreResponse(answer) {
    var success = '' + JSON.parse(answer).success;
    if ('true' == success) {
        var requestSysId = JSON.parse(answer).requestSysId;
        showSuccessMessage(requestSysId);
    } else {
        var errorMessage = JSON.parse(answer).message;
        showErrorMessage(errorMessage);
    }
}

function showErrorMessage(message) {
    var gm = new GlideModal("glide_alert_standard", false, 600);
    gm.setTitle("Bulk Restore Request Error");
    gm.setPreference("title", message);
    gm.setPreference("warning", "true");
    gm.render();
}

function showSuccessMessage(requestSysId) {
    var gm = new GlideModal("glide_alert_standard", false, 600);
    gm.setTitle("Bulk Restore Request Success");
    gm.setPreference("title", "Created bulk restore request.");
    gm.setPreference("warning", "false");
    gm.render();
}
