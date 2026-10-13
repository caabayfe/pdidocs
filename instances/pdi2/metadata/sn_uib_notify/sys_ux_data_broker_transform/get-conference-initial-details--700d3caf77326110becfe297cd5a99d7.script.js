function transform(input) {
    if (!input.conferenceId || !input.sysId || !input.table) {
        return;
    }
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.getConferenceDetails(input.conferenceId, input.table, input.sysId);
}
