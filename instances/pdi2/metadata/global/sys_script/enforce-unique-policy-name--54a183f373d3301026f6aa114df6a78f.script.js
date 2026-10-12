(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("cmdb_policy_type");
	gr.addQuery("name", current.name);
	gr.query();
	if (gr.hasNext()) {
		gr.next();
		if (gr.getValue("sys_id") != current.sys_id) {
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("A CMDB Policy Type by that name already exists."));
		}
	} 
	
})(current, previous);
