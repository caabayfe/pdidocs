function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	var indicator = new GlideAggregate('pa_widgets');
	indicator.addEncodedQuery('indicator.type=1');
	if (id)
		indicator.addEncodedQuery('sys_idIN' + id, true);
	indicator.groupBy('indicator');
	indicator.query();
	while (indicator.next()) {
		var indicatorID = indicator.indicator.toString();
		if (!util.isIndicatorScheduled(indicatorID)) {
			var widget = new GlideRecord('pa_widgets');
			widget.addQuery('indicator', indicatorID);
			if (id)
				widget.addEncodedQuery('sys_idIN' + id);
			widget.query();
			while (widget.next()) {
				result.push(widget.getValue('sys_id'));
			}
		}
	}
	return result;
}

executeDiagnostic(id);
