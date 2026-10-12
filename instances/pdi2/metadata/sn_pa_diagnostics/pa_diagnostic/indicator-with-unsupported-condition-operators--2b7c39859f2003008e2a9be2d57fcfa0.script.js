function executeDiagnostic(id) {
	var result = [];
	var indicator = new GlideRecord('pa_indicators');
	if (id)
		indicator.addEncodedQuery('sys_idIN' + id);
	indicator.addEncodedQuery('conditionsISNOTEMPTY');
	indicator.query();
	var util = new global.PAUtils();
	while (indicator.next()) {   
		if (util.hasRestrictedOperatorsInConditions(indicator.getValue('conditions')))
			result.push(indicator.getValue('sys_id'));
	}
	return result;
}

executeDiagnostic(id);
