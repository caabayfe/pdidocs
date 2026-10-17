(function executeRule(current, previous /*null when async*/) {

	// Users cannot edit sharing records, so we only enter here on an insert.
	// In this particular use case we want to ensure that either the user or group
	// submitted exists within the instance.
	
	if (current.user) {
		var userGR = new GlideRecord("sys_user");
		var userExists = userGR.get(current.user);
		if (!userExists) {
			// User does not exist, abort insert
			current.setAbortAction(true);
		}
	} else if (current.user_group) {
		var userGroupGR = new GlideRecord("sys_user_group");
		var userGroupExists = userGroupGR.get(current.user_group);
		if (!userGroupExists) {
			// User group does not exist, abort insert
			current.setAbortAction(true);
		}		
	}
		
})(current, previous);
