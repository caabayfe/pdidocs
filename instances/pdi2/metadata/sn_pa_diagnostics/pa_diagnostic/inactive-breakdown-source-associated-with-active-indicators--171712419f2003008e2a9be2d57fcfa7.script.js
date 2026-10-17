function executeDiagnostic(id) {
	var result = [];
	var foundInactiveBreakdownSrc = false;
	var breakdownSrc = new GlideRecord('pa_dimensions');
	if (id)
		breakdownSrc.addEncodedQuery('sys_idIN' + id);
	breakdownSrc.addQuery('active', false);
	breakdownSrc.query();

	while (breakdownSrc.next()) {
		foundInactiveBreakdownSrc = false;
		var breakdown = new GlideRecord('pa_breakdowns');
		breakdown.addQuery('dimension', breakdownSrc.sys_id.toString());
		breakdown.query();
		
		while (breakdown.next()) {
			if(foundInactiveBreakdownSrc)
				break;
			
			var indicatorBreakdown = new GlideRecord('pa_indicator_breakdowns');
			indicatorBreakdown.addQuery('breakdown', breakdown.sys_id.toString());
			indicatorBreakdown.query();
			while (indicatorBreakdown.next()) {
				var paJob = new GlideRecord('pa_job_indicators');
				paJob.addQuery('indicator', indicatorBreakdown.indicator.toString());
				paJob.addQuery('collect_indicator', true);
				paJob.addActiveQuery();
				paJob.query();
				if (paJob.next()) {
					result.push(breakdownSrc.getValue('sys_id'));
					foundInactiveBreakdownSrc = true;
					break;
				}
			}
		}
	}
	return result;
}

executeDiagnostic(id);
