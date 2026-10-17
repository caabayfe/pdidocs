(function executeRule(current, previous /*null when async*/) {

	gs.log("About to Redeploy Service Mapping Fast Recomputation jobs due to property change (" + current.name +")");
	var utils = new ServiceMappingRecomputationUtils();
	utils.removeFastScheduledJobs();

	var jobCount = gs.getProperty('glide.service_mapping.fast_recomputation.job_count', utils.defaultJobCount());
	utils.deployFastScheduledJobs(jobCount);

})(current, previous);
