(function executeRule(current, previous /*null when async*/) {
	var regex = current.regex;
	if (regex && (regex.startsWith('/'))) {
		gs.addErrorMessage(gs.getMessage('Not a valid regular expression. Please provide just the regular expression'));
		current.setAbortAction(true);
	}
	
})(current, previous);
