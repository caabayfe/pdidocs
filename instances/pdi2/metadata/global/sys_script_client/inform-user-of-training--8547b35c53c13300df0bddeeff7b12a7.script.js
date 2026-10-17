function onLoad() {
	if (g_form.getValue('training_outcome') === 'Training in progress') {
		g_form.addInfoMessage(getMessage('MetricBase Training in Progress'));
	}
}
