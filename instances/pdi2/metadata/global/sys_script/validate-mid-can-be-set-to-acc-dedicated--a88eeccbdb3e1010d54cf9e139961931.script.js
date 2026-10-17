(function executeRule(current, previous /*null when async*/) {

	var rec = new GlideRecord("ecc_agent_cluster_member_m2m");
	rec.addQuery("agent", current.mid_server);
	rec.addQuery("cluster.type", "Distributed");
	rec.query();
	
	while (rec.next()) { 
		var cluster = new GlideRecord("ecc_agent_cluster_member_m2m");
		cluster.addQuery("cluster", rec.cluster);
		cluster.addQuery("cluster.type", "Distributed");
		cluster.query();
		
		if (cluster.getRowCount() > 1){
			current.acc_mid_dedicated = false;
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("Cannot set MID to acc dedicated as there are more MIDs in the cluster"));	
			break;
		}
	}
})(current, previous);
