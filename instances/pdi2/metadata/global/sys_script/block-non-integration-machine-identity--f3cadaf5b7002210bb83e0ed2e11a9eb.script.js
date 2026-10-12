(function executeRule(current, previous /*null when async*/) {

	if (!current.user.web_service_access_only) {
		var msg = gs.getMessage("The user in a Machine Identity Access Config must be an integration (Web Service) user.");
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}

})(current, previous);
