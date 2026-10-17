function showDisableWarningModal() {
    var dialog = new GlideModal('glide_modal_confirm', true, 500);
    dialog.setTitle(new GwtMessage().getMessage('Disable Data Snapshots?'));
    dialog.setPreference('body', new GwtMessage().getMessage("If you disable Data Snapshots, this indicator will support no more than 2 levels of breakdowns. Are you sure you want to turn Data Snapshots off for this indicator?"));
    dialog.setPreference('focusTrap', true);
    dialog.setPreference('onPromptComplete', doComplete);
    dialog.setPreference('buttonLabelComplete', new GwtMessage().getMessage('Yes'));
    dialog.setPreference('buttonLabelCancel', new GwtMessage().getMessage('No'));
    dialog.render();
}

function doComplete() {
    gsftSubmit(null, g_form.getFormElement(), 'disable_data_snapshots');
}

function insertOrUpdateDSStatusToDisabled(indicatorSysId) {
	var DS_DISABLED = "2";
	var gr = new GlideRecord("pa_indicator_data_snapshot_status");
	if(gr.get("indicator", indicatorSysId)) {
		gr.setValue("data_snapshot_status", DS_DISABLED);
		gr.update();
		return;
	}
	gr.initialize();
	gr.setValue("indicator",indicatorSysId);
	gr.setValue("data_snapshot_status", DS_DISABLED);
	gr.insert();
}
if (typeof window == 'undefined') {
	insertOrUpdateDSStatusToDisabled(current.getValue("sys_id"));
    current.setValue('is_mlb_enabled', false);
    current.update();
}
