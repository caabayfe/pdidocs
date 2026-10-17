function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	var widgetIndicators = new GlideRecord('pa_widget_indicators');
	if (id)
		widgetIndicators.addEncodedQuery('sys_idIN' + id);
	widgetIndicators.addNotNullQuery('indicator');
	widgetIndicators.query();
	while (widgetIndicators.next()) {
		if (!util.isValidReference('pa_indicators', widgetIndicators.getValue('indicator'))) {
			result.push(widgetIndicators.getValue('sys_id'));
		}
	}
	return result.join(',');
}

executeDiagnostic(id);
