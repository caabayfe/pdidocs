function onLoad() {
	var currentState = g_form.getValue("state") || "";
	if (g_scratchpad.wrapUpData == null) {
		g_form.removeOption("state", "wrap_up");
	} else if (g_scratchpad.wrapUpData.enable_codes && !currentState.startsWith("closed")) {
		g_form.removeOption("state", "closed_complete");
		g_form.removeOption("state", "closed_abandoned");
	}

	if (g_scratchpad.agentChat == "true" && g_scratchpad.channelMetadataTable == "sys_cs_conversation") {
		g_form.removeOption("state", "closed_abandoned");
	}
}
