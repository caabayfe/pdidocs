function onLoad() {
	if ((g_user.hasRole("admin") || g_user.hasRole("pa_data_collector")) && !g_form.getValue('managing_indicator'))  
		g_form.showRelatedList('pa_job_indicators');
	else
		g_form.hideRelatedList('pa_job_indicators');
}
