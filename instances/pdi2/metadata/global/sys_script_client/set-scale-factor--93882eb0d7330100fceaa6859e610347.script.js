function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	//Type appropriate comment here, and begin script below
	if (newValue == 'rating')
		g_form.setValue('scale_factor', 5);
}
