(function executeRule(current, previous /*null when async*/) {
	if (!(current.display_name)) {
		current.active = false;
		gs.addErrorMessage(gs.getMessage("Can't create launch application with no name. Acton was set to inactive."));
	}
	
	if (!(current.url)) {
		current.active = false;
		gs.addErrorMessage(gs.getMessage("Can't create launch application with no url. Acton was set to inactive."));
	}
})(current, previous);
