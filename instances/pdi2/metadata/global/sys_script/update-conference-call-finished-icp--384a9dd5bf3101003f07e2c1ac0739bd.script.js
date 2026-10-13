function updateIA() {
    var participantList = "";
    var notifyUtils = new NotifyUtil();
    // get participants for current conference call
    var participant = new GlideRecord("notify_participant");
    participant.addQuery("notify_conference_call", current.sys_id);
    participant.query();
    var i18nMsg;
    // calculate duration for each participant
    while (participant.next()) {
        var user;
        var number = participant.getValue('phone_number');
        if (participant.getValue('user')) {
            var userSysId = participant.getValue('user');
            var userGr = new GlideRecord('sys_user');
            if (userGr.get(userSysId)) {
                user = userGr;
            }
        } else {
            user = notifyUtils.getUserByNumber(number, true);
        }
        var name = (notifyUtils.isDefined(user)) ? user.name : number;
        var duration = new GlideDateTime(participant.duration);
        if (duration.getNumericValue() > 0) {
            i18nMsg = gs.getMessage("{0} participated for {1}", [name, participant.duration.getDisplayValue()]);
            participantList += i18nMsg + "\n";
        } else {
            i18nMsg = gs.getMessage("{0} did not join the conference call", [name]);
            participantList += i18nMsg + "\n";
        }
    }

    // update incident alert comments
    var ia = new GlideRecord("incident_alert");

    if (ia.get(current.source)) {
        ia.comments = gs.getMessage("Conference call {0} finished at: {1} \nConference Call duration: {2} \nParticipants:\n{3}", [current.number, current.sys_updated_on.getDisplayValue(), current.duration.getDisplayValue(), participantList]);
        ia.update();
    }
}

updateIA();
