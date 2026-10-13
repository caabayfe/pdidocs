(function executeRule(current, previous) {
	// force the record to be in the domain of MID/Cluster it executes on.
	var gr;
	var refField;
	var executeOn = current.getValue("execute_on");
	if (executeOn == "Specific MID Server Cluster") {
		gr = new GlideRecord("ecc_agent_cluster");
		refField = "mid_server_cluster";
	} else { // Specific MID Server
		gr = new GlideRecord("ecc_agent");
		refField = "mid_server";
	}
	if (!gr.get(current.getValue(refField))) {
		gs.addErrorMessage(gs.getMessage("Empty/Invalid MID Server/Cluster selected to run this Web Server."));
		current.setAbortAction(true);
		return;
	}
	var domain = gr.getValue("sys_domain");
	current.setValue("sys_domain", domain);
})(current, previous);
