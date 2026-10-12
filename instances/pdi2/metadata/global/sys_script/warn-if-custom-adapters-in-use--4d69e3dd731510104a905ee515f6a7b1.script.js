(function executeRule(current, previous /*null when async*/) {

	var provAppGR = new GlideRecord('sys_cs_provider_application');
	provAppGR.query();
	if (provAppGR.hasNext()) {
		gs.addInfoMessage(gs.getMessage("Custom adapter conversations do not support the \"Connect\" fulfiller UI, so they will route to Agent Workspace."));
	}

})(current, previous);
