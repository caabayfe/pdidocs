(function executeRule(current, previous /*null when async*/) {
	
	var curOi = new GlideRecord("ecc_agent_ext_context_metric");
	curOi.addQuery("mid_server", current.agent);
	curOi.query();
	
	var gr = new GlideRecord("ecc_agent_cluster_member_m2m");
	gr.addQuery("cluster", "=", current.cluster);
	gr.addQuery("cluster.type", "Distributed");
	gr.query();
	
	if (curOi.next() && curOi.acc_dedicated_mid == true){	
		if(gr.hasNext()){
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Cluster {0} is not empty', [GlideStringUtil.escapeHTML(current.cluster.name)]));
		}
	}
	else{
		while(gr.next()){
			var oi = new GlideRecord("ecc_agent_ext_context_metric");
			oi.addQuery("mid_server", gr.agent);
			oi.addQuery("acc_dedicated_mid", "true");
			oi.query();

			if (oi.hasNext()){
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage('Cluster {0} has an ACC dedicated mid', [GlideStringUtil.escapeHTML(current.cluster.name)]));
				break;
			}
		}
	}


})(current, previous);
