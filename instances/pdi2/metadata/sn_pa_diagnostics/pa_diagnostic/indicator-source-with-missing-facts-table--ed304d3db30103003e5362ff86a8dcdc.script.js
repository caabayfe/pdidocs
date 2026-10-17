function executeDiagnostic(id) {
	var result = [];
	var isGR = new GlideRecord('pa_cubes');
	if (id)
		isGR.addEncodedQuery('sys_idIN' + id);
	isGR.query();
	
	while (isGR.next()) {
		var tblGR= new GlideRecord(isGR.getValue('facts_table'));
		if(!tblGR.isValid()){
			result.push(isGR.getValue('sys_id'));
		}
	}
	return result;
}

executeDiagnostic(id);
