function transform(input) {
	var util = new sn_cmdb_ws.MultisourceUtil();

	// get max records to process
	var maxRecordsToProcess = util.getMaxRecordsToProcess();
	
	// get agent not reporting days
	var notReportingMaxDays = util.getDiscoSourceNotReporting();
	
	// get coverage classes
	var coverageClasses = util.getCoverageClasses();
	
	var coverageWeightType = util.getCoverageWeightType();

	// get data mismatch classes
	var dataMismatchClasses = util.getDataMismatchClasses();
	
	var dataMismatchWeightType = util.getDataMismatchWeightType();
	
	// return results
	var results = {
		'maxRecordsToProcess' : maxRecordsToProcess,
		'notReportingMaxDays' : notReportingMaxDays,
		'coverageClasses' : coverageClasses,
		'coverageWeightType' : coverageWeightType,
		'dataMismatchClasses' : dataMismatchClasses,
		'dataMismatchWeightType' : dataMismatchWeightType
	};

	return results;
}
