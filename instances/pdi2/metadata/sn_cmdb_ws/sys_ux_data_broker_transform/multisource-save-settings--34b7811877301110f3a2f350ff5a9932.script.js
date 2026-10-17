function transform(input) {
	var util = new sn_cmdb_ws.MultisourceUtil();
	
	var results = {
		status : util.STATUS.SUCCESS,
		maxRecordsToProcess : null, 
		maxNotReportingDays : null,
		dataMismatchResult : null,
		coverageResult : null,
		dataMismatchWeight : null,
		coverageWeight: null
	};
	
	
	try {
		
		// Save max records to process
		if(input.settings.maxRecordsToProcess)
			results.maxRecordsToProcess = util.setMaxRecordsToProcess(input.settings.maxRecordsToProcess);
		
		// Save agent not reporting days
		if(input.settings.notReportingMaxDays)
			results.maxNotReportingDays = util.setDiscoSourceNotReporting(input.settings.notReportingMaxDays);
		
		// Save Coverage Classes
		if(Array.isArray(input.settings.coverageClasses))
			results.coverageResult = util.saveCoverageClasses(input.settings.coverageClasses);

		// Save Data Mismatch Classes
		if(Array.isArray(input.settings.dataMismatchClasses)) 
			results.dataMismatchResult = util.saveDataMismatchClasses(input.settings.dataMismatchClasses);

		if(input.settings.coverageWeightType)
			results.coverageWeight = util.saveCoverageWeightType(input.settings.coverageWeightType);
		
		if(input.settings.dataMismatchWeightType)
			results.dataMismatchWeight = util.saveDataMismatchWeightType(input.settings.dataMismatchWeightType);
				
		
	} catch(error) {
		results.status = util.STATUS.FAILED;
		results.error = error;
		results.message = gs.getMessage("failed to update settings : {0} ",error.toString());
	}


	return results;
}
