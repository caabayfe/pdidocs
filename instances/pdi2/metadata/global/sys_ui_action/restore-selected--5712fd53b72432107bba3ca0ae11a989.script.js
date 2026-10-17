function restoreSelected() {
	var ga = new GlideAjax('BulkRestoreRequester');
	ga.addParam('sysparm_archive_table', g_list.tableName);
	ga.addParam('sysparm_sys_ids', g_list.getChecked());
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
