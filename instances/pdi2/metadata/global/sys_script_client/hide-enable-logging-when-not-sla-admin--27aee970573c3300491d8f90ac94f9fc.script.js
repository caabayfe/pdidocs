function onLoad() {
    if (!g_scratchpad.sla_metadata || g_scratchpad.sla_metadata.is_sla_admin !== true)
		g_form.setDisplay("enable_logging", false);
}
