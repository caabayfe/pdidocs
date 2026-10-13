function transform(input) {
    if (!input || !input.searchText) return {};
    var confUtils = new NotifyUXFConferenceUtil();
    return confUtils.searchConferenceParticipants(input.searchText);
}
