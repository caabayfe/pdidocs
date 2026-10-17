function executeDiagnostic(id) {
	var result = [];
	var relGR = new GlideAggregate('pa_job_indicators');
	if (id)
		relGR.addEncodedQuery('jobIN' + id, true);
	relGR.addEncodedQuery('indicator.type!=1');
	relGR.addAggregate('COUNT');
	relGR.groupBy('job');
	relGR.query();
	while (relGR.next()) {
		result.push(relGR.job.toString());
	}
	return result.join(',');
}

executeDiagnostic(id);
