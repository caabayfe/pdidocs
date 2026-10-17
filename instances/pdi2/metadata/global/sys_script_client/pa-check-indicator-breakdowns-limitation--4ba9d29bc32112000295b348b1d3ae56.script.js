function onLoad() {
	if (g_scratchpad.pa_indicator_breakdown_count > 10)
	   g_form.addWarningMessage(getMessage('pa.indicator.breakdown_limitation'));
}
