function executeDiagnostic(id) {
	var result = [];
	var diagnosticUtil = new PADiagnosticsUtil();
 	var grIndicatorSrc = new GlideRecord('pa_cubes');
	if (id)
		grIndicatorSrc.addEncodedQuery('sys_idIN'+id);
	grIndicatorSrc.query();
	while (grIndicatorSrc.next()) {
		if (diagnosticUtil.isRotatedTable(grIndicatorSrc.getValue('facts_table')))
			result.push(grIndicatorSrc.getValue('sys_id'));
	}
 	return result.join(',');
 }
 
 executeDiagnostic(id);
