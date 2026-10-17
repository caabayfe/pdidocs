function onLoad() {
    if (g_form.getValue('type') == 'list' && g_form.getValue('visualization') == 'scorecard' && g_form.getValue('tag') == '') 
		if (g_scratchpad && g_scratchpad.pa_widget_indicators_count < 1)
			g_form.addWarningMessage(getMessage("A Scorecard widget must have an indicator group or at least one widget indicator"));
	return true;
}
