(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addErrorMessage(gs.getMessage("Recipient list users are more than the max email requirement {0}", gs.getProperty('sn_publications.max_email')));
})(current, previous);
