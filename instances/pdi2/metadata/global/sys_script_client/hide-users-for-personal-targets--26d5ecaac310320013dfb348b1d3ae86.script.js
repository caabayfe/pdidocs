function onLoad() {
   var highLevelUser = g_user.hasRole('pa_admin') || g_user.hasRole('pa_power_user') || g_user.hasRole('pa_target_admin');
	if (g_form.getValue('owner') || !highLevelUser)
		g_form.hideRelatedList('pa_m2m_targets_users.target');
}
