gs.log('Starting to delete the "Clean up dangling references from sys_object_source" scheduled job');
deleteCleanUpScheduleJob();

function deleteCleanUpScheduleJob() {
	var gr = new GlideRecord("sysauto_script");
	gr.addQuery("sys_id", "1121b4fadbd320504ae9c16c13961915");
	gr.query();
	if (gr.next()) {
		gr.deleteRecord();
	}
}
