function onChange(control, oldValue, newValue, isLoading) {
	g_form.setDisplay('dow_for_rotate', newValue == 'weekly');
}
