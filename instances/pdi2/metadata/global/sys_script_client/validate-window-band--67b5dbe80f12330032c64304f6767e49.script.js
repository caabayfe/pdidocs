function onSubmit() {
	var window = g_form.getValue("window_band");
	
	if (window.indexOf("-") !== -1) {
		g_form.addErrorMessage(getMessage('MetricBase Window Range'));
		return false;
	}
	
}
