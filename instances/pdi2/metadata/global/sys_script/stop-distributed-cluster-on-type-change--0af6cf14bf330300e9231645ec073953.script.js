(function executeRule(current, previous /*null when async*/) {
    // if the cluster was of type distributed then stop ignite on the cluster members
	if(previous.type == "Distributed" && current.type != previous.type) {
		var gr = new GlideRecord("ecc_agent_cluster_member_m2m");
		gr.addQuery("cluster", current.sys_id);
		gr.query();
		while(gr.next()) {
			var midName = gr.getDisplayValue("agent");
			var message = new GlideRecord("ecc_queue");
			message.setValue("topic", "SystemCommand");
			message.setValue("source", "stop_cluster_node");
			message.setValue("agent", "mid.server." + midName);
			message.setValue("queue", "output");
			message.setValue("state", "ready");
			message.insert();
		}
	}

})(current, previous);
