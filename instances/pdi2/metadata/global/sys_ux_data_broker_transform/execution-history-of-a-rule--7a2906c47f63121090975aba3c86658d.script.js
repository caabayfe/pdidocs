function transform(input) {
	var ruleId = input.ruleId;
	var ruleType = input.ruleType;
	var tableName = input.tableName;
	var offset = input.offset;

	var filter = new sn_data_management_rule_backlog.DmRuleExecutionFilter();
	filter.setTableNames([tableName]);
	filter.setRuleFilter(ruleId, ruleType);
	filter.setRuleTypes([ruleType]);
	filter.setOffset(ruleType, offset);

	// Get 1 year of execution history
	var startDate = new GlideDate();
	startDate.addDaysUTC(-365);
	filter.setPeriodStartDate(startDate.getValue());

	// load 10 execution histories from offset.
	filter.setLimit(10);

	var rulesApi = new sn_data_management_rule_backlog.DmRuleExecutionApi();
	response = JSON.parse(rulesApi.getDmRuleExecutions(filter));

	var rows = [];
	if(response.responseMetadata.status == 'SUCCESS' && response.executions.length > 0) {
		rows = response.executions.map(res => {
			var executionTime = new GlideDateTime(new Date(res.startDate));
			return {
				"executionTime": executionTime.toString(),
				"recordsImpacted": res.recordCount,
				"duration": res.endDate - res.startDate
			};
		});
	}

	var totalRecords = response.totalByType[ruleType] || response.offsetByType[ruleType];
	var jsonResponse = {};
	jsonResponse.rows = rows;
	jsonResponse.count = totalRecords;
	return jsonResponse;
}
