function executeDiagnostic(id) {
	var DAY_DURATION=24*60*60*1000;
	var result = [];
	var jobList = new GlideAggregate('pa_job_logs');
	if (id)
		jobList.addEncodedQuery('jobIN' + id, true);
	jobList.addQuery('state', '!=', 'collecting');
	jobList.groupBy('job');
	jobList.query();
	while (jobList.next()) {
		var paJob = new GlideRecord('sysauto_pa');
		if (!paJob.get(jobList.job) || (paJob.run_type == 'on_demand') || (paJob.run_type == 'once')) {
			//ignore collection jobs that no longer exist and non-periodic
			continue;
		}

		var jobLog = new GlideRecord('pa_job_logs');
		jobLog.addQuery('job', jobList.job);
		jobLog.query();
		var totalRunTime = 0;
		while (jobLog.next()) {
			totalRunTime += jobLog.run_time.dateNumericValue();
		}
		var avgRunTime = totalRunTime/jobLog.getRowCount();  
		if (avgRunTime >= DAY_DURATION) {
			result.push(paJob.getValue('sys_id'));
		}
	}

	return result.join(',');
}

executeDiagnostic(id);
