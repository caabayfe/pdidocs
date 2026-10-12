(function executeRule(current, previous /*null when async*/) {

	if (current.getValue("direction") == "child_impacts_parent" && !current.getValue("child_class")) {
		gs.addErrorMessage(gs.getMessage("Cannot set empty child class with Child impacts parent direction"));
		current.setAbortAction(true);
	} else if (current.getValue("direction") == "parent_impacts_child" && !current.getValue("parent_class")) {
		gs.addErrorMessage(gs.getMessage("Cannot set empty parent class with Parent impacts child direction"));
		current.setAbortAction(true);
	}

})(current, previous);
