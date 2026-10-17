function onLoad() {
	if (g_user.hasRole('pa_admin') || g_user.hasRole('pa_threshold_admin') || g_user.hasRole('pa_power_user'))
		return;
	
	g_form.setVisible('owner', false);
}
