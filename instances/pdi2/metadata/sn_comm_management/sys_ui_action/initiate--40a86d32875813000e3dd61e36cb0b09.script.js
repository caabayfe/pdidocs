//This is copied and used in UI macro "incident_alert_conferences"
function showParticipantsDialog() {
	if(g_scratchpad.upgradeMsg)
		g_form.addWarningMessage(g_scratchpad.upgradeMsg);
	var client = new NotifyOnTaskClient(g_form.getTableName(), g_form.getUniqueValue());
	var inputData = {
		sourcePlan: g_scratchpad.commPlanID,
		sourceTask: g_form.getUniqueValue(),
		commTaskClass: g_scratchpad.commTaskClass,
		followOnCallEscalation: g_scratchpad.followOnCallEscalation,
		notifyGroupSelector: g_scratchpad.notifyGroupSelector,
		reloadPage: true,
		showAllMsgs: true,
		addToWorkNotes: false
	};
	if(typeof client.openConferenceDialog != 'function') {
		getMessage('Notify is upgrading (or) NotifyOnTaskClient UI Script is customized. Please contact your System Administrator', function(msg) {
				g_form.addWarningMessage(msg);
			});
		return;
	}
	if (g_form.getValue("short_description")) {
		var modalTitle = new GwtMessage().getMessage("Initiate {0}", g_form.getValue("short_description"));
		var dialogOptions = {
			title: modalTitle
		};
		client.openConferenceDialog(inputData, dialogOptions);
	} else
		client.openConferenceDialog(inputData);
}
