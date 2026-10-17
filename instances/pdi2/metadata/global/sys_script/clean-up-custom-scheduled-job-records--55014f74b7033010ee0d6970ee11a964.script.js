(function executeRule(current, previous /*null when async*/) {

	var jobId = current.policy_execution_job + '';
	var tableGr = new GlideRecord('cmdb_policy_scheduled_job');
	tableGr.addQuery('sys_id', jobId);
	tableGr.query();
	if (tableGr.next()) {
		tableGr.deleteRecord();
	}

})(current, previous);
