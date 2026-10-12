(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("cmdb_group_contains_qb_query");
	gr.addQuery("qb_query", current.sys_id);
	gr.query();
	// One QB query could be associated with many groups
	while(gr.next()) {
		sn_cmdbgroup.CMDBGroupAPI.enqueueEvent(gr.group, 'update');	
	}
})(current, previous);
