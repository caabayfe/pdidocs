function onCondition() {
	if (g_scratchpad.sla_metadata.engine == "2011")
		g_form.setDisplay("retroactive_pause", true);
	else
		g_form.setDisplay("retroactive_pause", false);
}
