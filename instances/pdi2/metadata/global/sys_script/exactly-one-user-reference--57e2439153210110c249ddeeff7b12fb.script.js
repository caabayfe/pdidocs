(function executeRule(current, previous /*null when async*/) {

	var userReferences = 0;
	if (current.user) userReferences++;
	if (current.user_group) userReferences++;
	if (current.global) userReferences++;

	if (userReferences != 1) {
		current.setAbortAction(true);
		var errorMessage = gs.getMessage("Please set exactly one of user, user_group, or global");
		gs.addErrorMessage(errorMessage);
	}

})(current, previous);
