(function refineQuery(current, parent) {
	var mids = [];
	if(parent.getValue("type") == "Distributed") {
		var gr = new GlideRecord("ecc_agent_cluster_member_m2m");
		gr.addQuery("cluster", parent.getUniqueValue());
		gr.query();
		
		while(gr.next()) {
			mids.push(gr.getValue("agent"));
		}
	}
	current.addQuery("agent", "IN", mids);
})(current, parent);
