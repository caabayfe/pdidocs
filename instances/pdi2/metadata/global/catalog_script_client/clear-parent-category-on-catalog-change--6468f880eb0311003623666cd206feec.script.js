function onChange(control, oldValue, newValue, isLoading) {
	if (newValue == '' || newValue != oldValue)
		g_form.clearValue("variables.parent");
}
