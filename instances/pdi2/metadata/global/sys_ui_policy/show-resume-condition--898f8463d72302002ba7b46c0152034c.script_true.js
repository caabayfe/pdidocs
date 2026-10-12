function onCondition() {
	if (g_scratchpad.sla_metadata.engine == "2011")
		g_form.setVisible("resume_condition", true);
	else
		g_form.setVisible("resume_condition", false);
}
