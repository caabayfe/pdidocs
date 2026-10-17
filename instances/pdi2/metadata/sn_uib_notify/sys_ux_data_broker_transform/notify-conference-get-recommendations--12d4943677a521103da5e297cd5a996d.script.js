function transform(input) {
    if (!input || !input.table || !input.sysId || !input.type) return [];
    var confUtils = new NotifyUXFConferenceUtil();
	var data = {
		table: input.table,
		sysId: input.sysId,
		type: input.type,
		conferenceId: input.conferenceId
	};
    return confUtils.getRecommendations(data);
}
