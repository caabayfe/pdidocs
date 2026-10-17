(function executeRule(current, previous /*null when async*/) {

	var util = new CSDMCMDBUtil();
	gs.log("Begin CSDM Data Sync after deletion of technical service offering", "CSDMCMDBUtil");
	var rels = new GlideRecord("cmdb_rel_ci");
	rels.addEncodedQuery("parent=" + current.sys_id + "^child.sys_class_name=cmdb_ci_query_based_service", true);
	rels.query();
	while (rels.next()) {
		if (util.isDynamicCiGroup(rels.getValue("child"))) {
			var job = new GlideRunScriptJob();
			job.scheduleScript("new CSDMCMDBUtil().updateOnTsoRelDelete(" + JSON.stringify(rels.getValue("child")) + ")");
		}
	}

})(current, previous);
