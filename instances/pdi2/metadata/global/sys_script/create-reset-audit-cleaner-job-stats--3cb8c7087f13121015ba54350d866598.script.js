(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord('sys_audit_cleaner_job_progress');
	gr.addQuery('sys_audit_retention', current.sys_id);
	gr.query();
	if (gr.next()) {
		gr.setValue('sys_audit_last_processed_time', '');
		gr.setValue('sys_audit_delete_last_processed_time', '');
		gr.update();
	}
	else {
		gr.initialize();
		gr.setValue('sys_audit_retention', current.sys_id);
		gr.insert();
	}

})(current, previous);
