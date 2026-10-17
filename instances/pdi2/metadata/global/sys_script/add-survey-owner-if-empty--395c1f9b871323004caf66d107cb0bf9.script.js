(function executeRule(current, previous /*null when async*/) {
	current.survey_owners = [gs.getUserID()].toString();
})(current, previous);
