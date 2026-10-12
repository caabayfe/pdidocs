function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	
	var indicatorSrc = new GlideRecord('pa_cubes');
	if (id)
		indicatorSrc.addEncodedQuery('sys_idIN' + id);
	indicatorSrc.query();
	while (indicatorSrc.next()) {
		if (!util.isValidCondition(indicatorSrc.facts_table, indicatorSrc.conditions)) {
			result.push(indicatorSrc.getValue('sys_id'));
		}
	}
	
	return result;
}

executeDiagnostic(id);
