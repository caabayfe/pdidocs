function onSync() {
	var jobID = null;
	if (!current.active)
		return;
	var grJob = new GlideRecord('sys_job');
	grJob.addQuery('name', 'PAJob');
	grJob.query();
	if (grJob.next()) {
		jobID = grJob.getUniqueValue();
	}
	if (jobID == null)
		return;
	var gr = new GlideRecord('sys_trigger');
	gr.addQuery('document_key', current.sys_id);
	gr.query();
	while (gr.next()) {
		gr.setValue('job_id', jobID);
		gr.update();
	}

}
onSync();
