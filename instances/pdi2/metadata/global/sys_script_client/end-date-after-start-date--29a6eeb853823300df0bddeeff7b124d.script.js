function onSubmit() {
	if (g_form.getValue('end') <= g_form.getValue('start')) {
		g_form.addErrorMessage(getMessage('Training Dataset End Date must be at a later date/time than the Training Dataset Start Date'));
		return false;
	}
}
