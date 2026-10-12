(function executeRule(current, previous /*null when async*/) {

	// is the transaction coming from legacy agent workspace
	var isAgentWorkspace = false;
	var request = GlideTransaction.get().getRequest();
	if (request) {
		var url = request.getHeader("referer");
		isAgentWorkspace = url && url.indexOf("/now/workspace/agent/") >= 0;
	}

	if (isAgentWorkspace)
		current.setValue("chg_model", "007c4001c343101035ae3f52c1d3aeb2");

})(current, previous);
