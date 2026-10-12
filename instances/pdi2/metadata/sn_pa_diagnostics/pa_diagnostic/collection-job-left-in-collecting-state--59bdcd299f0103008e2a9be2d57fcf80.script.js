function executeDiagnostic(id) {
	var result = [];
	var jobList = new GlideAggregate('pa_job_logs');
	if (id)
		jobList.addEncodedQuery('sys_idIN' + id, true);
	jobList.addQuery('state', 'collecting');
	jobList.addAggregate('COUNT');
	jobList.groupBy('job');
	jobList.query();
	while (jobList.next()) {
		var trigger = new GlideAggregate('sys_trigger');
		trigger.addQuery('job_context', 'CONTAINS', 'fcDocumentKey='+jobList.job);
		trigger.addQuery('state', 1);
		trigger.addAggregate('COUNT');
		trigger.query();
		var totalRunTime = 0;
		
		if (trigger.next()) {
			var numTrigger = trigger.getAggregate('COUNT');
			
			if (numTrigger != jobList.getAggregate('COUNT')) {
				var job = new GlideRecord('pa_job_logs');
				job.addQuery('job', jobList.job);
				job.addQuery('state', 'collecting');
				job.orderByDesc('sys_created_on');
				job.query();
				
				while (numTrigger > 0) {
					//skip the latest collecting jobs that has running triggers
					job.next();
					numTrigger--;
				}
				
				while (job.next()) {
					result.push(job.getValue('sys_id'));
				}
			}
		}
	}

	return result.join(',');
}

executeDiagnostic(id);
