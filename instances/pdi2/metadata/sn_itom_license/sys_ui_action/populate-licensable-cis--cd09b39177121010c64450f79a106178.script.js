function populate() {

	var selSysIds = g_list.getChecked();
	if (!selSysIds){
		alert("No records selected!");
		cancelReport();
	}
	else {
		var ajaxHelper = new GlideAjax('sn_itom_licensing.ITOMTriggerLicensableCIsReportStore');
		ajaxHelper.addParam('sysparm_name', 'isListingJobRunning');
		ajaxHelper.addParam('sysparm_selValueStreams', JSON.stringify(selSysIds));
		ajaxHelper.getXMLAnswer(triggerJob.bind(this, selSysIds), null, null);
	}
}

function triggerJob(selSysIds, answer) {
	if(answer == 'true') {
		var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
		var dlg = new dialogClass('glide_modal_info');
		dlg.setTitle(new GwtMessage().getMessage('Info'));
		dlg.setWidth(500);
		dlg.setPreference('body', "Atleast one of the selected job is already running. Please wait or run the jobs which are not in running state !!");
		dlg.setPreference('onPromptComplete', cancelReport.bind(this));
		dlg.render();
	}
	else showConfDlg(selSysIds);
}

function showConfDlg(selSysIdsList) {

	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
	var dlg = new dialogClass('glide_modal_confirm');
	dlg.setTitle(new GwtMessage().getMessage('Warning'));
	dlg.setWidth(500);
	dlg.setPreference('body', "This action will clean up existing licensable CIs report. Continue?");
	dlg.setPreference('onPromptCancel', cancelReport.bind(this));
	dlg.setPreference('onPromptComplete', populateReport.bind(this, selSysIdsList));
	dlg.render();
}

function cancelReport(){
	g_list.refresh();
}

function populateReport(sysIdList){
	var ajaxHelper = new GlideAjax('sn_itom_licensing.ITOMTriggerLicensableCIsReportStore');
	ajaxHelper.addParam('sysparm_name', 'initReports');
	ajaxHelper.addParam('sysparm_selValueStreams', JSON.stringify(sysIdList));
	ajaxHelper.getXMLAnswer(showMessage.bind(this), null, null);
}
function showMessage(answer, s){
	if(answer == 'false') {
		var message = "Failed to schedule one or more jobs. Please check logs."
	}
	else { 
		var message = "Job submitted successfully";
	}
	var dialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
	var dlg = new dialogClass('glide_modal_info');
	dlg.setTitle(new GwtMessage().getMessage('Info'));
	dlg.setWidth(500);
	dlg.setPreference('body', message);
	dlg.setPreference('onPromptComplete', cancelReport.bind(this));
	dlg.render();
}
