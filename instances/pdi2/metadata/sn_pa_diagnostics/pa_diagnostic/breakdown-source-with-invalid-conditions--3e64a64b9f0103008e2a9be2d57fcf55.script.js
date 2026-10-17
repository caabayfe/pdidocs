function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	
	var breakdownSrc = new GlideRecord('pa_dimensions');
	if (id)
		breakdownSrc.addEncodedQuery('sys_idIN' + id);
	breakdownSrc.query();
	while (breakdownSrc.next()) {
		if (!util.isValidCondition(breakdownSrc.facts_table, breakdownSrc.conditions)) {
			result.push(breakdownSrc.getValue('sys_id'));
		}
	}
	
	return result;
}

executeDiagnostic(id);
