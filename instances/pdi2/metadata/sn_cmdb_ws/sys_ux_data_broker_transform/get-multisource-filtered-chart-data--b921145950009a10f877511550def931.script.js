function transform(input) {
	var ciFilterType = input.ciFilterType;
	result = {
		"result": {},
		"input": ciFilterType,
		"errorMessage": ""
	};

	var util = new sn_cmdb_ws.MultisourceDashboardChartFilterUtil(ciFilterType);

	if (!util.isCiFilterTypeValid()) {
		result.errorMessage = "CI Filter type has invalid value: " + ciFilterType;
	} else {
		var chartData = util.getChartInformation();
		result.result = chartData;
	}

	return result;
}
