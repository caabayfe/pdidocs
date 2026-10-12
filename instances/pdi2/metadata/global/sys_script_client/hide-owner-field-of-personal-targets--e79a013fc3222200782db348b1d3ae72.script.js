function onLoad() {
	if (g_user.hasRole('pa_admin') || g_user.hasRole('pa_target_admin') || g_user.hasRole('pa_power_user'))
		return;
	
	if (g_user.hasRole('pa_viewer'))
		g_form.setVisible('owner', false);
}
