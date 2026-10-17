function onLoad() {
	// control visibility
	var gr = new GlideRecord(g_form.getTableName());
	gr.get(g_form.getUniqueValue());
	if ((gr.getValue('type') !== "2" /*Discovered*/) && !g_user.hasRole('service_mapping_user'))
	   //(g_user.hasRole('app_service_user') && !g_user.hasRole('app_service_admin')))
	   g_form.setVisible('traffic_discovery', false);

	// control read-only
	if (g_user.hasRole('app_service_user') && !g_user.hasRole('service_mapping_admin'))
       g_form.setDisabled('traffic_discovery', true);
	
}
