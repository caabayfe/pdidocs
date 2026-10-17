if(current.state == "Closed") {
	var alertManager = new SNC.AlertManager();
	alertManager.addStep("Alert BR: Delete related Threshold Staging records (after)");
	var alertId = current.sys_id;
	var thresholdStagingGr = new GlideRecord('em_threshold_staging');
	thresholdStagingGr.addQuery('alert', alertId);
	thresholdStagingGr.query();
	while(thresholdStagingGr.next()) {
		thresholdStagingGr.deleteRecord();
	}	
}
