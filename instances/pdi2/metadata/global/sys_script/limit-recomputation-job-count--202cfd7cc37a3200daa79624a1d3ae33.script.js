(function executeRule(current, previous /*null when async*/) {

	var utils = new ServiceMappingRecomputationUtils();
	var isFast = (current.name == 'glide.service_mapping.fast_recomputation.job_count');
	var otherJobCount = 0;
	if (isFast) 
		otherJobCount = parseInt(gs.getProperty('glide.service_mapping.recomputation.job_count', utils.defaultJobCount()));
	else 
		otherJobCount = parseInt(gs.getProperty('glide.service_mapping.fast_recomputation.job_count', utils.defaultJobCount()));
	
	var workers = parseInt(gs.getProperty('glide.sys.schedulers', 8));	
	var currentJobCount = parseInt(current.value);
	var allRecompJobCount = currentJobCount + otherJobCount;
	if (allRecompJobCount > workers) {
		var msg = gs.getMessage('Recomputation job count (regular+fast): {0}, cannot be greater than the number of worker threads: {1}', [allRecompJobCount, workers]);
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}
	
	if (currentJobCount < 0) {
		var msg1 = gs.getMessage('Recomputation job count ({0}) cannot be lower than 0', [currentJobCount]);
		gs.addErrorMessage(msg1);
		current.setAbortAction(true);
	}

})(current, previous);
