(function executeRule(current, previous /*null when async*/) {

	var job = new GlideRunScriptJob();
	job.scheduleScript("new CSDMCMDBUtil().updateCiOnAssocDelete(" + JSON.stringify(current.getValue("ci_id")) + ")");

})(current, previous);
