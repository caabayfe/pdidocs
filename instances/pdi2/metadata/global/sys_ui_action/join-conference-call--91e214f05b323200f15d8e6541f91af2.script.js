function addCurrentUserToTheCall() {
	var participant = new GlideRecord('notify_participant');
	participant.addQuery('active', true);
	participant.addQuery('notify_conference_call', g_scratchpad.activeCallId);
	participant.query(participantCallBackFn);
}

function participantCallBackFn(participant) {
	var presentInCall = false;
	// iterate over participants
	while (participant.next()) {
		if (participant.user === g_user.userID) {
			presentInCall = true;
			break;
		}
	}
	if (presentInCall === false) {
		showLoadingDialog();
		var sourceId = g_form.getUniqueValue();
		var ccId = g_scratchpad.activeCallId;
		var ga = new GlideAjax('IncidentAlertNotifyAjax');
		ga.addParam('sysparm_participants', g_user.userID);
		ga.addParam('sysparm_id', sourceId);
		ga.addParam('sysparm_ccid', ccId);
		ga.addParam('sysparm_name', 'addToConferenceCall');
		ga.getXML(addParticipantCallback);
	} else {
		getMessage("Participant already in call", function(msg) {
			alert(msg);
			window.location.reload();
		});
	}
}

function addParticipantCallback(response) {
	hideLoadingDialog();
	var xml = response.responseXML;
	var items = xml.getElementsByTagName("conference_call_participant");
	var success = items[0].getAttribute("success");
	if (success === "true") {
		gsftSubmit(null, g_form.getFormElement(), 'join_conference_call');
	}
}

if (typeof window == 'undefined')
	reloadForm();

function reloadForm() {
	action.setRedirectURL(current);
	gs.addInfoMessage(gs.getMessage("You have been added to the active conference call"));
}
