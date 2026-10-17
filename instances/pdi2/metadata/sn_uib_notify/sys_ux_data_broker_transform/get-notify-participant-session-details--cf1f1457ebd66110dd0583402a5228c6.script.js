function transform(input) {
    var participant_session_sys_id = input.participant_session_sys_id;
    var participantSessionGr = new GlideRecord("notify_participant_session");
    if (participantSessionGr.get(participant_session_sys_id)) {
        var obj = {};
        var participantGr = participantSessionGr.notify_participant.getRefRecord();
        if (participantGr.isValidRecord()) {
            obj.changes = {
                muted: participantSessionGr.muted + "",
            };
            obj.participantGr = participantGr.getUniqueValue();
        }
        return obj;
    }
    return null;
}
