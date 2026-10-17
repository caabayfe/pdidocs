function onCondition() {
	if (g_scratchpad.sla_metadata.engine == "2011")
		g_form.setVisible("cancel_condition", true);
	else
		g_form.setVisible("cancel_condition", false);
}
