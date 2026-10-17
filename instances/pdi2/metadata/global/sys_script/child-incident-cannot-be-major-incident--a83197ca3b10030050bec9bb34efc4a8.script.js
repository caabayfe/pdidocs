(function executeRule(current, previous /*null when async*/) {
	if ("accepted" == current.getValue("major_incident_state")) {
		current.setAbortAction(true);
		var link = '<a href="' + current.getLink() + '">' + current.number + '</a>';
		gs.addErrorMessage(gs.getMessage("Major Incident {0} cannot be a child of an Incident", link));
	} else {
		current.setValue("major_incident_state", "");
		gs.addInfoMessage(gs.getMessage('{0} is no longer a Major Incident Candidate', current.getDisplayValue()));
	}
})(current, previous);
