function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	
	var filter = new GlideRecord('pa_filters');
	if (id)
		filter.addEncodedQuery('sys_idIN' + id);
	filter.query();
	while (filter.next()) {
		if (!util.isValidCondition(filter.dimension.facts_table, filter.filter)) {
			result.push(filter.getValue('sys_id'));
		}
	}
	
	return result;
}

executeDiagnostic(id);
