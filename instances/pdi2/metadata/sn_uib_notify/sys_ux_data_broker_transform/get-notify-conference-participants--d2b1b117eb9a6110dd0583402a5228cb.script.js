function transform(input) {
	if (!input.conferenceId){
		return;
	}
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.getParticipantsDetailsInAConference(input.conferenceId);
}
