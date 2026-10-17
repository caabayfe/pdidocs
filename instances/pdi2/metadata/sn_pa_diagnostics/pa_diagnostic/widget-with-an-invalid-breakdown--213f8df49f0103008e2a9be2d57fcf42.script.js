function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	var widget = new GlideRecord('pa_widgets');
	if (id)
		widget.addEncodedQuery('sys_idIN' + id);
	widget.addEncodedQuery('breakdownISNOTEMPTY^ORbreakdown_level2ISNOTEMPTY');
	widget.query();
	while (widget.next()) {
		if ((!util.isValidReference('pa_breakdowns', widget.getValue('breakdown'))) || (!util.isValidReference('pa_breakdowns', widget.getValue('breakdown_level2')))) {
			result.push(widget.getValue('sys_id'));
		}
	}
	return result.join(',');
}

executeDiagnostic(id);
