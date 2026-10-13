(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord(current.getTableName());
	gr.addQuery("agent", current.agent);
	gr.addQuery("cluster", "!=", current.cluster);
	gr.addQuery("cluster.type", "Distributed");
	gr.query();
	if(gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('MID Server {0} can be part of only one distributed cluster', current.agent.name));
	}

})(current, previous);
