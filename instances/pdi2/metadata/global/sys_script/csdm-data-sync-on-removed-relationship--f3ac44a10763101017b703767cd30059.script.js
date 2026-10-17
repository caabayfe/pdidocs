(function executeRule(current, previous /*null when async*/) {
	var util = new CSDMCMDBUtil();
	
	// check if dcg is still associated to the tso
	var ga = new GlideAggregate("cmdb_rel_ci");
	ga.addAggregate("COUNT", "sys_id");
	ga.addQuery("parent", current.parent);
	ga.addQuery("child", current.child);
	ga.query();
	if (ga.next() && ga.getAggregate("COUNT", "sys_id") > 0)
		return;

	// if the dynamic ci group was deleted then svc_ci_assoc BR will handle it
	var queryDcg = new GlideRecord("cmdb_ci_query_based_service");
	if (!queryDcg.get(current.child))
		return;
	
	var job = new GlideRunScriptJob();
	job.scheduleScript("new CSDMCMDBUtil().updateOnTsoRelDelete(" + JSON.stringify(queryDcg.getValue("sys_id")) + ")");

})(current, previous);
