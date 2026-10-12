function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil(); 
	var paScript = new GlideRecord('pa_scripts');
	paScript.addNotNullQuery('arguments');
	if (id)
		paScript.addEncodedQuery('sys_idIN' + id);
	paScript.query();
	while (paScript.next()) {
		var fieldList = paScript.getValue('arguments').toString().split(',');
		var script = util.removeComments(paScript.getValue('script'));
		var currentField = script.match(/current((\.\w+)\b(?!\s*\())+/g);
		if (!currentField) {
			//no current used in the script
			continue;
		}
		for (var i = 0; i < currentField.length; i++) {
			var field = currentField[i].replace(/current\./g,'');
			if (!new global.ArrayUtil().contains(fieldList, field)) {
				result.push(paScript.getValue('sys_id'));
				break;
			}
		}
	}
	
	
	return result;
}

executeDiagnostic(id);
