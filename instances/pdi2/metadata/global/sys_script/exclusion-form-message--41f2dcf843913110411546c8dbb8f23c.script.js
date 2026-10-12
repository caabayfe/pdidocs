(function executeRule(current, previous /*null when async*/) {
	var job_criteria_exclusions = [];
	var current_sys_id = current.sys_id;

	// Get all job_criteria from other rows where exclusive is true
	var gr = new GlideRecord('sys_node_type');
	gr.addQuery('sys_id', '!=', current_sys_id);
	gr.addQuery('schedulers', '!=', 'specified');
	gr.addQuery('exclusive', true);
	gr.query();

	while(gr.next()) {
		job_criteria_exclusions.push(gr.getValue('job_criteria'));
	}

	// De-duplicate job criteria exclusion values
	var arrayUtil = new ArrayUtil();
	job_criteria_exclusions = arrayUtil.unique(job_criteria_exclusions);
	g_scratchpad.job_criteria_exclusions = job_criteria_exclusions;

})(current, previous);
