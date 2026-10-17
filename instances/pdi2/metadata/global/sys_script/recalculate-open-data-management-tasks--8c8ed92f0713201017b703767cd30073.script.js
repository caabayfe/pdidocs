(function executeRule(current, previous /*null when async*/) {

	if (!gs.hasRole('data_manager_user')) {
        gs.error('Access denied: User does not have the required role.');
        return;
    }

	// Grabs all open tasks for the current policy and updates the open_task_count runtime attributes value
	
	var count = 0;
	var gaTask = new GlideAggregate('cmdb_data_management_task');
	gaTask.addQuery('policy_id', current.policy_id);
	gaTask.addQuery('state', 1);  // Open state
	gaTask.addAggregate('COUNT');
	gaTask.query();
	if (gaTask.next()) {
		count = parseInt(gaTask.getAggregate('COUNT'));
	}
	var grPolicyRuntimeAttribs = new GlideRecord('cmdb_data_management_policy_runtime_attributes');
	grPolicyRuntimeAttribs.addQuery('policy', current.policy_id);
	grPolicyRuntimeAttribs.query();
	if (!grPolicyRuntimeAttribs.next()) {
		return;
	} else {
		grPolicyRuntimeAttribs.setValue('open_task_count', count);
		grPolicyRuntimeAttribs.update();
	}
	

})(current, previous);
