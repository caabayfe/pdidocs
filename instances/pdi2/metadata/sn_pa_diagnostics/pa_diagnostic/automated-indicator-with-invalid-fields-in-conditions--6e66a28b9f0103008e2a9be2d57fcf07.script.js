function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	
	var indicator = new GlideRecord('pa_indicators');
	if (id)
		indicator.addEncodedQuery('sys_idIN' + id);
	indicator.addQuery('type', 1);
	indicator.query();
	while (indicator.next()) {
		if (!util.isValidCondition(indicator.cube.facts_table, indicator.conditions)) {
			result.push(indicator.getValue('sys_id'));
		}
	}
	
	return result;
}

executeDiagnostic(id);
