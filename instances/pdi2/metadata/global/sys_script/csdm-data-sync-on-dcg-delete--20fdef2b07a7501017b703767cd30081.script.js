(function executeRule(current, previous /*null when async*/) {
	gs.log("Begin CSDM Data Sync on dynamic ci group delete.", "CSDMCMDBUtil");
	// query all CIs associated to the dcg being deleted for revert
	var svcCiAssoc = new GlideRecord("svc_ci_assoc");
	svcCiAssoc.addQuery("service_id", current.sys_id);
	svcCiAssoc.query();
	var ciSysIdArray = [];
	while (svcCiAssoc.next()) {
		ciSysIdArray.push(svcCiAssoc.getValue("ci_id"));
	}
	var job = new GlideRunScriptJob();
	// convert ci array to strings for scheduled job argument
	job.scheduleScript("new CSDMCMDBUtil().updateCiOnAssocDelete(" + JSON.stringify(ciSysIdArray.join()) + ")");

})(current, previous);
