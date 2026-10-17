function onLoad() {
    var highLevelUser = g_user.hasRole('pa_admin') || g_user.hasRole('pa_power_user') || g_user.hasRole('pa_threshold_admin');
	if (g_form.getValue('owner') || !highLevelUser)
		g_form.hideRelatedList('pa_m2m_thresholds_users.threshold');
}
