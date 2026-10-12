function executeDiagnostic(id) {
	var result = [];
	var util = new PADiagnosticsUtil();
	var indicatorList = [];
	var widgetIndicator = new GlideAggregate('pa_widget_indicators');
	widgetIndicator.addEncodedQuery('indicator.type=1');
	if (id)
		widgetIndicator.addEncodedQuery('sys_idIN' + id, true);

	widgetIndicator.groupBy('indicator');
	widgetIndicator.query();
	while (widgetIndicator.next()) {
		var indicator = widgetIndicator.indicator.toString();
		if (!util.isIndicatorScheduled(indicator))
			indicatorList.push(indicator);
	}
	//Will get all the widget indicators that has one of 
	widgetIndicator = new GlideRecord('pa_widget_indicators');
	widgetIndicator.addEncodedQuery('indicatorIN'+indicatorList.join(','));
	if(id)
		widgetIndicator.addQuery('sys_id', id);
	widgetIndicator.query();
	while (widgetIndicator.next())
		result.push(widgetIndicator.getValue('sys_id'));
	return result;
}
 
executeDiagnostic(id);
