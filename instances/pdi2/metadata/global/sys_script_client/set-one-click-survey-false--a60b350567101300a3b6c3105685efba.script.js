function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (newValue !== 'none' && g_form.getValue('one_click_survey') === 'true') {
		g_form.addErrorMessage(getMessage('To enable One Click Survey, please set the Pagination Setting to None'));
		g_form.setValue('portal_pagination', 'none');
	}
}
