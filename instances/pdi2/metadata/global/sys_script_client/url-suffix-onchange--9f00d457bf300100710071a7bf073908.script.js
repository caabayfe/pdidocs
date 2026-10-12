function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	// Update the public url if the url suffix changes:
	if (newValue == 'default') {
		g_form.setValue('public_url', '/$pwd_reset.do');
	} else {
		g_form.setValue('public_url', '/$pwd_reset.do?sysparm_url=' + newValue);
	}
}
