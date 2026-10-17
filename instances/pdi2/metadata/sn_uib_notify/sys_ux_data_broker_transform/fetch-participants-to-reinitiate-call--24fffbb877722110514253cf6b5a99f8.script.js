function transform(input) {
	var confUtils = new sn_uib_notify.NotifyUXFConferenceUtil();
	return confUtils.getParticipantsOnACall(input.sysId);
}
