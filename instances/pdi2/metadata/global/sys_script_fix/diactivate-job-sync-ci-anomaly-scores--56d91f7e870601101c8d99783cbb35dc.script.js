gs.log("Start deactivation of job - Sync CI Anomaly Scores");
deactivateJob();
gs.log("Deactivation of - Sync CI Anomaly Scores: finished");

function deactivateJob() {
	if (pm.isZboot())
		return;

	var scheduledJobs = new GlideRecord('sysauto_script');
	scheduledJobs.addQuery("sys_id", "f49ca3a4d7613200ee056dbd6e610331");
	scheduledJobs.addActiveQuery();
	scheduledJobs.query();
	if (scheduledJobs.next()) {
		var oldJobName = scheduledJobs.getValue("name");
		scheduledJobs.setValue("name", "Deprecated job: " + oldJobName);
		scheduledJobs.setValue("active", false);
		if (!scheduledJobs.update()) {
			gs.error("Could not update sysauto_script, JOB sys_id: f49ca3a4d7613200ee056dbd6e610331");
			return;
		}
	}
}
