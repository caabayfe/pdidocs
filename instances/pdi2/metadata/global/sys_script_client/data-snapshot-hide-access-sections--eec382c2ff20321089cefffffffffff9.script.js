function onLoad() {
	if (!g_user.hasRole('pa_admin') && !g_user.hasRole('pa_power_user')) {
		g_form.setSectionDisplay('access_control', false);   
	}
}
