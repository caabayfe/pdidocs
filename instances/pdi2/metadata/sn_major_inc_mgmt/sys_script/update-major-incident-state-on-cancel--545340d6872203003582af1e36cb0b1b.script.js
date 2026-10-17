(function executeRule(current, previous /*null when async*/) {

	if (previous.major_incident_state == new MajorIncidentTriggerRulesSNC().MAJOR_INCIDENT_STATE.ACCEPTED)
		gs.addInfoMessage(gs.getMessage('{0} is no longer a major incident', current.getDisplayValue()));
	else
		gs.addInfoMessage(gs.getMessage('{0} is no longer a major incident candidate', current.getDisplayValue()));

})(current, previous);
