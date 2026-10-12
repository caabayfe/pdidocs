function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
		return;
    }

    //Type appropriate comment here, and begin script below
	if (parseInt(newValue, 10) < 1) {
		g_form.setValue('quantity', '');
		g_form.showErrorBox('quantity', 'Quantity must be a positive integer');
	}
}
