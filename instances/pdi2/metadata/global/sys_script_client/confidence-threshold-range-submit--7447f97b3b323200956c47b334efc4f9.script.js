function onSubmit() {
   var confidenceVal = g_form.getIntValue('global_minimum_accuracy');
	
	if (confidenceVal < 0 || confidenceVal > 100) {
		g_form.showFieldMsg('global_minimum_accuracy', getMessage('Confidence Threshold must be between 0 and 100'), 'error');
		return false;
	}
}
