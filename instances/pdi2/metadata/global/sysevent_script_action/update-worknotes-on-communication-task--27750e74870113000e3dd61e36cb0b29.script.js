checkIfAllCallsAreInactive();

function checkIfAllCallsAreInactive() {
	//in case of failed calls, current.source will be undefined
	if (!current.source || (GlideDBObjectManager.get().getAllExtensions('comm_task').indexOf(current.source.sys_class_name + '') == -1))
		return;
	updateNotesInCommTask(current.source.getRefRecord(), current);
}

function updateNotesInCommTask(commTaskGr, conferenceCallGr) {
	var participantList = "";
	var notifyUtils = new global.NotifyUtil();
	// get participants for current conference call
	var i18nMsg;
	var participant = new GlideRecord("notify_participant");
	participant.addQuery("notify_conference_call", conferenceCallGr.sys_id);
	participant.query();
	while (participant.next()) {
		var user = '';
		var number = participant.getValue('phone_number');
		if (participant.getValue('user')) {
			var userSysId = participant.getValue('user');
			var userGr = new GlideRecord('sys_user');
			if (userGr.get(userSysId)) {
				user = userGr;
			}
		} else {
			if (number)
				user = notifyUtils.getUserByNumber(number, true);
		}
		var name = (notifyUtils.isDefined(user)) ? user.name : number;
		if (!name)
			name = participant.getValue('email') || participant.getValue('service_provider_user_name');
		var duration = new GlideDateTime(participant.duration);
		if (duration.getNumericValue() > 0) {
			i18nMsg = gs.getMessage("{0} participated for {1}", [name, participant.duration.getDisplayValue()]);
			participantList += i18nMsg + "\n";
		} else {
			i18nMsg = gs.getMessage("{0} did not join the conference call", [name]);
			participantList += i18nMsg + "\n";
		}
	}
	var now = new GlideDateTime();
	var conferenceDuration = new GlideDuration(gs.dateDiff(conferenceCallGr.getDisplayValue('sys_created_on'), now.getDisplayValue()));
	commTaskGr.comments = gs.getMessage("Conference call {0} finished at: {1} {2} \nConference Call duration: {3} \nParticipants:\n{4}", [conferenceCallGr.number, conferenceCallGr.sys_updated_on.getDisplayValue(), gs.getUser().getTZ(), conferenceDuration.getDisplayValue(), participantList]);
	commTaskGr.update();

}
