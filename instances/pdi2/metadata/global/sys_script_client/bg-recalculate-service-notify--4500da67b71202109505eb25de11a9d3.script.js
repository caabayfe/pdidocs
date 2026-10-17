function onLoad() {
	var bgRunId = g_user.getClientData('sm_recalc_srv_bg');

	if (bgRunId) 
		CustomEvent.fireAll('sm_recalc_srv_bg_triggered', bgRunId);
}
