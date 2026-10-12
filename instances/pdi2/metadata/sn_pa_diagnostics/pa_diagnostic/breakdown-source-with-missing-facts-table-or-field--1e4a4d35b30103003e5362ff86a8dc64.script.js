function executeDiagnostic(id) {
	var result = [];
	var isGR = new GlideRecord('pa_dimensions');
	var util = new PADiagnosticsUtil();
	if (id)
		isGR.addEncodedQuery('sys_idIN' + id);
	isGR.query();
	
	while (isGR.next()) {
		var tblGR= new GlideRecord(isGR.getValue('facts_table'));
		if(!tblGR.isValid() || !util.isValidField(isGR.getValue('facts_table'), isGR.getValue('field'))){
			result.push(isGR.getValue('sys_id'));
		}
	}
	return result;
}

executeDiagnostic(id);
