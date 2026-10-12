function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	
	if (newValue === 'true' && g_form.getValue('portal_pagination') !== 'none') {
		g_form.addErrorMessage(getMessage('To enable One Click Survey, please set the Pagination Setting to None'));
		g_form.setValue('one_click_survey','false');
	}
	
}
