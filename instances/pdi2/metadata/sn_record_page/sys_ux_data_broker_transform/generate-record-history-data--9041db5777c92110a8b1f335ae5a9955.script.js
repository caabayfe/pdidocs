function transform(input) {
	if (!input || !input.table || !input.sysId)
        return {};

	var recordHistoryDataGenerator = new global.RecordHistoryDataGenerator();

	return {
		historySetId : recordHistoryDataGenerator.generateHistoryData(input.table, input.sysId),
		refreshRequest : recordHistoryDataGenerator.generateRefreshRequest()
	};
}
