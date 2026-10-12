(function executeRule(current, previous /*null when async*/) {

	var ciSysId = current.ci;
	if (!ciSysId) {
		gs.error('Empty CI sys_id in attestation task to CI table');
		return;
	}
	
	var policyId = current.cmdb_data_management_task.policy_id;
	if (!policyId) {
		gs.error('Empty policy Id in attestation task to CI table');
		return;
	}
	
	var gr = new GlideRecord('sn_cmdb_ws_attestation_task_to_ci');
	gr.addQuery('ci', ciSysId);
	gr.addQuery('cmdb_data_management_task.policy_id', policyId);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		gs.info('CI with id ' + ciSysId + ' cannot be inserted to attestation task to CI table under same attestation policy with id ' + policyId);
	}

})(current, previous);
