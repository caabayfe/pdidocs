function cancel() {
	var selSysIds = g_list.getChecked();

	if (!selSysIds){
		alert("No records selected to cancel");
	}
	else {
		var ajaxHelper = new GlideAjax('sn_itom_license.ITOMTriggerLicensableCIsReport');
		ajaxHelper.addParam('sysparm_name', 'isListingJobRunning');
		ajaxHelper.addParam('sysparm_selValueStreams', JSON.stringify(selSysIds));
		ajaxHelper.getXMLAnswer(triggerCancel.bind(this, selSysIds), null, null);
	}
}

function triggerCancel(selSysIds, answer) {
		if(answer == 'true') {
			var ajaxHelper = new GlideAjax('sn_itom_license.ITOMTriggerLicensableCIsReport');
			ajaxHelper.addParam('sysparm_name', 'cancelListingJobs');
			ajaxHelper.addParam('sysparm_selValueStreams', JSON.stringify(selSysIds));
			ajaxHelper.getXMLAnswer(showMessage.bind(this), null, null);
		}
		else {
			var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
			var dlg = new dialogClass('glide_modal_info');
			dlg.setTitle(new GwtMessage().getMessage('Info'));
			dlg.setWidth(500);
			dlg.setPreference('body', "Selected job is not running currently");
			dlg.setPreference('onPromptComplete', refresh.bind(this));
			dlg.render();
		}
}

function refresh(){
	g_list.refresh();
}

function showMessage(){
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
	var dlg = new dialogClass('glide_modal_info');
	dlg.setTitle(new GwtMessage().getMessage('Info'));
	dlg.setWidth(500);
	dlg.setPreference('body', "Cancel request submitted successfully.");
	dlg.setPreference('onPromptComplete', refresh.bind(this));
	dlg.render();
}
