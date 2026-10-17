function onLoad() {
	g_form.setDisplay('is_template', false);
	g_form.setDisplay('template_type', false);
	if(g_form.isNewRecord() && g_user.hasRole("sn_process_mining_admin")) {
		g_form.setDisplay('is_template', true);
	} else if(!g_form.isNewRecord()) {
		if(g_form.getValue("is_template") == "true") {
			g_form.setDisplay('is_template', true);
			g_form.setDisabled('is_template', true);
			g_form.setDisplay('template_type', true);
		}
	}
}
