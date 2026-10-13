function onSubmit() {
	var window = g_form.getValue("window_linear_predictor");
	
	if (window.indexOf("-") !== -1) {
		g_form.addErrorMessage(getMessage('MetricBase Window Range'));
		return false;
	}
}
