function executeDiagnostic(id) {
	var result = [];
	var job = new GlideAggregate('pa_job_indicators');
	job.addEncodedQuery('job.active=true^job.run_typeNOT INonce,on_demand');
	if (id)
		job.addEncodedQuery('indicatorIN' + id, true);
	job.addQuery('collect_indicator', true);
	job.addQuery('active', true);
	job.addAggregate('COUNT');
	job.groupBy('indicator');
	job.query();
	while (job.next()) {
		if (job.getAggregate('COUNT') > 1) {
			result.push(job.indicator.toString());
		}
	}
	return result.join(',');
}

executeDiagnostic(id);
