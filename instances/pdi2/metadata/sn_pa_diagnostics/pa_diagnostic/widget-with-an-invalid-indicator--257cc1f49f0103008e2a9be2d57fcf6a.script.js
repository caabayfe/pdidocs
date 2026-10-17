function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	var widget = new GlideRecord('pa_widgets');
	if (id)
		widget.addEncodedQuery('sys_idIN' + id);
	widget.addNotNullQuery('indicator');
	widget.query();
	while (widget.next()) {
		if (!util.isValidReference('pa_indicators', widget.getValue('indicator'))) {
			result.push(widget.getValue('sys_id'));
		}
	}
	return result.join(',');
}

executeDiagnostic(id);
