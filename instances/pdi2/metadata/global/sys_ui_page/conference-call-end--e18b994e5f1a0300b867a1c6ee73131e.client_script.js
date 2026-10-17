function continueOK() {
	disableOkDisplayLoading(endConferenceCallback);
}

function disableOkDisplayLoading(callBackFn) {
	document.getElementById("btn-conf-ok").classList.add('disabled');
	showLoadingDialog(callBackFn);
}

function endConferenceCallback() {
	var conferenceCallID = g_scratchpad.activeCallId;
	if (conferenceCallID) {
		var ga = new GlideAjax('IncidentAlertNotifyAjax');
		ga.addParam('sysparm_name', 'endConference');
		ga.addParam('sysparm_conferenceId', conferenceCallID);
		ga.getXML(callParse);
	} else {
		document.location.reload();
	}
}

function callParse(response) {
	var dialog = GlideModal.prototype.get('conference_call_end');
	hideLoadingDialog();
	dialog.destroy();
	document.location.reload();
}

function continueCancel() {
	var dialog = GlideModal.prototype.get('conference_call_end');
	dialog.destroy();
	return false;
}
