function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	if (newValue <= 0) {
		g_form.showErrorBox('order_size', getMessage('Please provide a value greater than 0'));
	}
}
