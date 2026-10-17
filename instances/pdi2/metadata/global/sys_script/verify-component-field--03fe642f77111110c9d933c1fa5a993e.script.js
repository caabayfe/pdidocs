(function executeRule(current, previous /*null when async*/) {
	if(current.type != "viewport" && gs.nil(current.component)){
		gs.addErrorMessage(gs.getMessage("Component field must not be blank"));
		current.setAbortAction(true);
	}
	else if(current.type == "viewport" && !gs.nil(current.component)){
		gs.addErrorMessage(gs.getMessage("Component field must be blank for type headless viewports"));
		current.setAbortAction(true);
	}
})(current, previous);
