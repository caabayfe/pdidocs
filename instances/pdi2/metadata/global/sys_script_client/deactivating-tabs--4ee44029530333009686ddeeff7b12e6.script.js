function onLoad() {
	g_tabs2Sections.deactivate();
	
	if(!g_form.getBooleanValue("contact_live_agent"))
		g_form.setDisabled("support_hours_label",true);
	if(!g_form.getBooleanValue("phone_call")) {
		g_form.setDisabled("support_phone_label",true);
		g_form.setDisabled("support_phone",true);
	}
	if(!g_form.getBooleanValue("send_email")) {
		g_form.setDisabled("support_email_label",true);
		g_form.setDisabled("support_email",true);
	}
}
