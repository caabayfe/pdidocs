function executeDiagnostic(id) {
	var result = [];
	
	var formIndicator = new GlideRecord('pa_indicators');
	if (id)
		formIndicator.addEncodedQuery('sys_idIN' + id);
	formIndicator.addQuery('type', 2);
	formIndicator.query();
	
	while (formIndicator.next()) {
		var paFormula = new global.ScopedPAFormula(formIndicator.getValue('formula'), formIndicator.getValue('sys_id'));
		if (!paFormula.isValid() || paFormula.getFormula().indexOf(formIndicator.sys_id) > 0) {
			result.push(formIndicator.getValue('sys_id'));
		}
	}
	
	return result;
}

executeDiagnostic(id);
