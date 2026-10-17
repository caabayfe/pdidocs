var liveAgentSetupGr = new GlideRecord('sys_cs_live_agent_setup');
liveAgentSetupGr.query();
while (liveAgentSetupGr.next()) {
	if (!liveAgentSetupGr.getValue("users_to_be_disconnected")) {
		liveAgentSetupGr.setValue("users_to_be_disconnected", "non_resumable_guest");
		liveAgentSetupGr.update();
	}
}
