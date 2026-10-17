function onLoad() {
	if (g_form.isNewRecord()) {
		// init from parent consumes
		if (g_scratchpad.parent_produces != '')
			g_form.setValue('produces', g_scratchpad.parent_produces);
		else
			g_form.setValue('produces', 'application/json,application/xml,text/xml');
		
		// init from parent consumes
		if (g_scratchpad.parent_consumes != '')
			g_form.setValue('consumes', g_scratchpad.parent_consumes)
		else
			g_form.setValue('consumes', 'application/json,application/xml,text/xml');
	}
}
