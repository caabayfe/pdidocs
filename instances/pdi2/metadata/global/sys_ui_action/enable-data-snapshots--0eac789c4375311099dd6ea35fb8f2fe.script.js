function showEnableWarningModal() {
    var dialog = new GlideModal('pa_enable_datasnapshots', true, 500);
    dialog.setPreference('sysIDs', [g_scratchpad.sys_id]);
    dialog.setPreference('onPromptComplete', doComplete);
    dialog.setPreference('onPromptCancel', doCancel);
    dialog.setPreference('sysparm_trigger', "form");
    dialog.render();

    function doCancel() {
        dialog.destroy();
    }
}

function doComplete() {
    gsftSubmit(null, g_form.getFormElement(), 'enable_data_snapshots');
}

function insertOrUpdateDSStatusToInProgress(indicatorSysId) {
	var DS_IN_PROGRESS = "3";
	var gr = new GlideRecord("pa_indicator_data_snapshot_status");
	if(gr.get("indicator", indicatorSysId)) {
		gr.setValue("data_snapshot_status", DS_IN_PROGRESS);
		gr.update();
		return;
	}
	gr.initialize();
	gr.setValue("indicator", indicatorSysId);
	gr.setValue("data_snapshot_status", DS_IN_PROGRESS);
	gr.insert();
}

if (typeof window == 'undefined') {
    var current_sys_id = current.getValue("sys_id");
	//update the record in indicator_data_snapshot_status table to in progress.
	insertOrUpdateDSStatusToInProgress(current_sys_id);
    SNC.PAMLBConversion.enableMLBForAutomatedAndFormulaIndicators([current_sys_id]);
    gs.flushMessages();
}
