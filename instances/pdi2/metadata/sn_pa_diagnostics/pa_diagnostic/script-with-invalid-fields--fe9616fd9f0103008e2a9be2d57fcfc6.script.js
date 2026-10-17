function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	var script = new GlideRecord('pa_scripts');
	if (id)
		script.addEncodedQuery('sys_idIN' + id);
	script.query();
	while(script.next()) {
		var argument = script.getValue('arguments');
		var field = argument.split(',');
		for(var i = 0; i < field.length; i++) {
			if (!util.isValidField(script.getValue('table'), field[i])) {
				result.push(script.getValue('sys_id'));
				break;
			}
		}
	}
	
	return result;
}

executeDiagnostic(id);
