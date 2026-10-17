function executeDiagnostic(id) {
	var result = [];
	var scGR = new GlideRecord('pa_scripts');
	if (id)
		scGR.addEncodedQuery('sys_idIN' + id);
	scGR.query();
	
	while (scGR.next()) {
		var tblGR= new GlideRecord(scGR.getValue('table'));
		if(!tblGR.isValid()){
			result.push(scGR.getValue('sys_id'));
		}
	}
	return result;
}

executeDiagnostic(id);
