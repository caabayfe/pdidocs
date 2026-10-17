(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage('both contains_strings and matches_regex cannot be empty'));
    current.setAbortAction(true);
    current.active = false;
    return;
})(current, previous);
