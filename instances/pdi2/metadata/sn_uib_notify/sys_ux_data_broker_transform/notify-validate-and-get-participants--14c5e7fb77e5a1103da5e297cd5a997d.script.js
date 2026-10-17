function transform(input) {
    if (!input || !input.data) return [];
    var confUtils = new NotifyUXFConferenceUtil();
	var data = {
		userId: input.data.userId,
		phoneNumber: input.data.phoneNumber,
		email: input.data.email,
		groupId: input.data.groupId,
		table: input.data.table,
		sysId: input.data.sysId,
		confId: input.data.confId,
		isSMS: input.data.isSMS
	};
	//data.userId, data.phoneNumber,data.email, data.groupId, data.table, data.sysId, data.confId
    return confUtils.validateAndGetParticipants(data);
}
