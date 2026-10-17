(function executeRule(current, previous /*null when async*/) {

	var cloudDetails = {};
	if(gs.nil(current.cloud_details)) {
		cloudDetails['cancel_clone_option'] = InstanceCloneUtil.getOptionsJson(CloneConstants.cancelOptions);
		cloudDetails['rollback_clone_option'] = InstanceCloneUtil.getOptionsJson(CloneConstants.rollbackOptions);
		current.cloud_details = JSON.stringify(cloudDetails);
	}

})(current, previous);
