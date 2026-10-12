function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (!g_user.hasRole('pa_admin') && !g_user.hasRole('pa_target_admin') && !g_user.hasRole('pa_power_user'))
		return;
	
	if (isLoading || newValue == '') 
		return;

	if (newValue != '') 
		g_form.setValue('any_element', true);
}
