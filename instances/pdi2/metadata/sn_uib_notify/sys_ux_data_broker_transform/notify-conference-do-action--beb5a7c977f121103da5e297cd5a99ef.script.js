function transform(input) {
    if (!input || !input.conferenceDetails || !input.action) return [];
	var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.doConferenceAction(input.action, input.conferenceDetails);
}
