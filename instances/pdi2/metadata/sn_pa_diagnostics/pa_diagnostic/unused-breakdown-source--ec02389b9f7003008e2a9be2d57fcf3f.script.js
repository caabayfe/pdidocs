function executeDiagnostic(id) {
	var result = [];

	var breakDownSrc =  new GlideRecord('pa_dimensions');
	if (id)
		breakDownSrc.addEncodedQuery('sys_idIN' + id);
	breakDownSrc.query();

	while (breakDownSrc.next()) {
		var breakDown = new GlideRecord('pa_breakdowns');
		breakDown.addQuery('dimension', breakDownSrc.sys_id.toString());
		breakDown.setLimit(1);
		breakDown.query();

		if (!breakDown.hasNext()) {
			//Check if the breakdown source defined to act as filter
			var dashboardSrc = new GlideRecord('pa_m2m_dashboard_sources');
			dashboardSrc.addQuery('breakdown_source', breakDownSrc.sys_id.toString());
			dashboardSrc.setLimit(1);
			dashboardSrc.query();
			if (!dashboardSrc.hasNext()) {
				result.push(breakDownSrc.sys_id.toString());
			}
		}
	}
	return result.join(',');
}

executeDiagnostic(id);
