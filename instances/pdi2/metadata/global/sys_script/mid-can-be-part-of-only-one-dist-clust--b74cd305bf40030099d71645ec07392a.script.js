(function executeRule(current, previous /*null when async*/) {
	
	// get all member
	var members = [];
	var cluster = new GlideRecord("ecc_agent_cluster_member_m2m");
	cluster.addQuery("cluster", current.sys_id);
	cluster.query();
	while(cluster.next()) {
		members.push(cluster.agent);
	}
	
	// check if any of the member is part of another distributed cluster
	var m2m = new GlideRecord("ecc_agent_cluster_member_m2m");
	m2m.addQuery("agent", "IN", members);
	m2m.addQuery("cluster", "!=", current.sys_id);
	m2m.addQuery("cluster.type", "Distributed");
	m2m.query();
	var mids = [];
	while(m2m.next()) {
		mids.push(m2m.agent.name);
	}
	
	if(mids.length > 0) {
		current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage('MID Servers {0} are already part of another distributed cluster', mids.toString()));
	}
		

})(current, previous);
