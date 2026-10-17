//show the participants slush bucket dialog
function showParticipantDialog() {
	var activeCall = new GlideRecord('notify_conference_call');
	activeCall.addQuery('source', g_form.getUniqueValue());
	activeCall.addQuery('active', true);
	activeCall.query(callBackFn);
}

function callBackFn(activeCall) {
	// check if there are any active conference calls related to the current incident alert
	if (activeCall.hasNext()) {
		getMessage('Conference call already in progress', function(msg) {
			alert(msg);
			window.location.reload();
		});
	} else {

		if(typeof NotifyOnTaskClient.getNotifyActionTemplate == 'function') {
			var notifyOnTask = new NotifyOnTaskClient(g_form.getTableName(), g_form.getUniqueValue());
			var confData = NotifyOnTaskClient.getNotifyActionTemplate();
			confData.addToWorkNotes = true;
			confData.reloadPage = true;
			notifyOnTask.openConferenceDialog(confData);
			return;
		}

		var dialog = new GlideModal('conference_call_participants');
		getMessage("Conference call participants", function(msg) {
			dialog.setTitle(msg);
			dialog.setPreference("sourceID", g_form.getUniqueValue());
			dialog.setPreference("focusTrap", true);
			dialog.render();
		});
	}

}
