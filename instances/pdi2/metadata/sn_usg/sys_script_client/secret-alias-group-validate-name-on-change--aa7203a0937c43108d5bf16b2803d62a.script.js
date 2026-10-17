function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || newValue === '')
		return;

	if (newValue.indexOf('.') !== -1) {
		g_form.showFieldMsg('name', 'Name must not contain "."', 'error');
		g_form.setValue('name', oldValue);
	} else {
		g_form.hideFieldMsg('name');
	}
}
