function onLoad() {
	var hideGroup = !(g_user.hasRole('admin') || g_user.hasRole('dashboard_admin') || g_user.hasRole('pa_admin') || g_user.hasRole('pa_power_user'));
	if (g_scratchpad.isCanvasActive === 'true' && hideGroup) {
		g_form.setDisplay('group', false);
	}
}
