function onLoad() {
   if(!g_user.hasRole('sn_process_mining_power_user')){
		g_form.hideRelatedList('promin_job_m2m_project');
	}
}
