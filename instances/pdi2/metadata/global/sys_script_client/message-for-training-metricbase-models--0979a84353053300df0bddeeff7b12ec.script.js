function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	g_form.clearMessages();
	
	var success = getMessage('MetricBase Training Successful');
	var partial = getMessage('MetricBase Training Partially Successful');
	var failed = getMessage('MetricBase Training Failed');
	
	if (newValue.startsWith(success)) {
		g_form.addInfoMessage(success + ' <a href="">Refresh</a>');
	} else if (newValue.startsWith(partial)) {
		g_form.addInfoMessage(partial + ' <a href="">Refresh</a>');
	} else if (newValue.startsWith(failed)){
		g_form.addErrorMessage(failed);
	}
}
