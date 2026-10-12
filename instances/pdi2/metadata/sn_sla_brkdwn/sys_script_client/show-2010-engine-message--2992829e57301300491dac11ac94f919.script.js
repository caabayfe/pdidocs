function onLoad() {
	if (g_scratchpad.slaEngineVersion !== "2011")
		g_form.addInfoMessage(new GwtMessage().getMessage("SLA Breakdowns are only processed for the 2011 version of the SLA engine.  You are currently running the {0} version.",
														  "<b>" + g_scratchpad.slaEngineVersion + "</b>"));
}
