function executeDiagnostic(id) {
	var result = [];
	var jobList = new GlideAggregate('pa_job_logs');
	if (id)
		jobList.addEncodedQuery('jobIN' + id, true);
	jobList.addQuery('state', 'collected_warning');
	jobList.groupBy('job');
	jobList.query();
	while (jobList.next()) {
		var jobLog = new GlideRecord('pa_job_logs');
		jobLog.addQuery('job', jobList.job);
		jobLog.orderByDesc('sys_created_on');
		jobLog.query();
		if (jobLog.next() && (jobLog.state=='collected_warning')) {
			result.push(jobList.job.toString());
		}
	}
	return result.join(',');
}

executeDiagnostic(id);
