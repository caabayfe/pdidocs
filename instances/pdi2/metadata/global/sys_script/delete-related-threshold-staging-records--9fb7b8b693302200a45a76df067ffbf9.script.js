if(current.state == "Closed") {
	var alertId = current.sys_id;
	var anomalyThresholdStagingGr = new GlideRecord('em_threshold_staging');
	anomalyThresholdStagingGr.addQuery('alert', alertId);
	anomalyThresholdStagingGr.query();
	while(anomalyThresholdStagingGr.next()) {
		anomalyThresholdStagingGr.deleteRecord();
	}	
}
