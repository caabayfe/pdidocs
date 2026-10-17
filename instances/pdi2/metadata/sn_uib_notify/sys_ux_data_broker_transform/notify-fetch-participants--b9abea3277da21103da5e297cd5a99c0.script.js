function transform(input) {
    if (!input || !input.table || !input.sysId || !input.type || !input.participants) return;
    var confUtils = new NotifyUXFConferenceUtil();
	var data = {
		table: input.table,
		sysId: input.sysId,
		type: input.type,
		participants: input.participants
	};
    return confUtils.fetchPreFilledParticipants(data);
}
