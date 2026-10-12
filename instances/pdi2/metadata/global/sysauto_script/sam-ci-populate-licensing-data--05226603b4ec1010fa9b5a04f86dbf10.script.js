function sampPopulateLUAData() {
	var sysTriggerGr = new GlideRecord('sys_trigger');
	sysTriggerGr.addQuery('job_context', 'CONTAINS', '05226603b4ec1010fa9b5a04f86dbf10');
	sysTriggerGr.addQuery('state', '1');
	sysTriggerGr.query();
	if (sysTriggerGr.getRowCount() >= 2) {
		// If there is already one job running, no need to run the current one
		return;
	}
	if(GlidePluginManager.isActive('com.snc.samp'))
	{
		var jobLogGr = new GlideRecord('samp_job_log');
		jobLogGr.initialize();
		jobLogGr.setValue('name', 'SAM/CI - Populate Licensing Data');
		jobLogGr.setValue('status', 'in progress');
		jobLogGr.insert();

		try {
			new global.SAMLicensingUtility().populateSAMCloudInsightsCIUsageData();
			jobLogGr.setValue('status', 'completed');
		} catch (error) {
			jobLogGr.setValue('status', 'failed');
		}
		jobLogGr.update();
	}else{
		new global.SAMLicensingUtility().populateSAMCloudInsightsCIUsageData();
	}
}
sampPopulateLUAData();
