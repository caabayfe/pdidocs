(function executeRule(current, previous /*null when async*/) {

	// Validate that a sharing record does not already exist for global sharing,
	// the specified user or group.
	
	var sharingGR = new GlideRecord("sys_app_template_sharing_m2m");
	sharingGR.addQuery("template", current.template);

	if (current.user) {
		// Check if the specified user already has a sharing record.
		sharingGR.addQuery("user", current.user);
	} else if (current.user_group) {
		// Check if the specified group already has a sharing record.
		sharingGR.addQuery("user_group", current.user_group);
	} else if (current.global) {
		// Check if a global sharing record already exists.
		sharingGR.addQuery("global", current.global);
	} else {
		// Nothing was specified, this should've been handled by another business rule, abort the insert.
        current.setAbortAction(true);
	}
	
	sharingGR.query();

	if (sharingGR.hasNext()) {
		// Duplicate record exists, abort the insert.
		current.setAbortAction(true);
	}

})(current, previous);
