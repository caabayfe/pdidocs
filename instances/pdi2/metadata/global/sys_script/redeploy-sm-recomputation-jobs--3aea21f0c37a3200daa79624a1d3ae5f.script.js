(function executeRule(current, previous /*null when async*/) {

	gs.log("About to Redeploy Service Mapping Recomputation jobs due to property change (" + current.name +")");
	var utils = new ServiceMappingRecomputationUtils();
	utils.removeScheduledJobs();

	var jobCount = gs.getProperty('glide.service_mapping.recomputation.job_count', utils.defaultJobCount());
	utils.deployScheduledJobs(jobCount);

})(current, previous);
