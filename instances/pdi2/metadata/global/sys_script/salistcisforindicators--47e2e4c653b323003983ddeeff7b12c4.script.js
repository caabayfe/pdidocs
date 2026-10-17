function saListCisForIndicators(bsId) {
	var dbObjMgr = GlideDBObjectManager.get();
	var allExt = dbObjMgr.getAllExtensions('cmdb_ci_endpoint');
		
	var gr = new GlideRecord('svc_ci_assoc');
	gr.addQuery('service_id', bsId);	
	
	//gr.addQuery("cmdb_ci.sys_class_name", "NOT IN", allExt);
	
	if (allExt.size() !== 0) {	
		var joinedGr = gr.addJoinQuery('cmdb_ci', 'ci_id', 'sys_id');
		joinedGr.addCondition('sys_class_name', 'NOT IN', allExt);
	}
	
	gr.query();
	
	var ids = [];
	while (gr.next()) 
		ids.push(gr.getValue('ci_id'));
	
	return ids.join(',');
}
