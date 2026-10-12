function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	var type = g_form.getValue('type');
	if (type != 'score')
		return;
	var options = g_form.getControl('visualization').options;
	if (!options)
		return;
	var realtimeExists = false;
	for (var i = 0; i < options.length; i++) {
		if (options[i].value == 'realtime') {
			realtimeExists = true;
			break;
		}
	}
	
	var aggregate = g_form.getValue('aggregate');
	if (aggregate.length > 0) {
		if (realtimeExists) {
		    g_form.removeOption('visualization', 'realtime');
		}
		return;
	}
	
	var gr = new GlideRecord('pa_indicators');
	var indicatorSysId = g_form.getValue('indicator');
	if (gr.get(indicatorSysId)) {
		if (gr.getValue('show_realtime_score') == 'false' || gr.getValue('formula').length > 0 || gr.getValue('scripted') == 'true') {
			if (realtimeExists)
				g_form.removeOption('visualization', 'realtime');
			return;
		}
	}
	
	if (!realtimeExists)
		g_form.addOption('visualization', 'realtime', 'Real-time Score', 4);
}
