(function executeRule(current, previous /*null when async*/) {

		gs.addErrorMessage(gs.getMessage('Active Email Account Groups must contain at least one email account'));
		current.setAbortAction(true);

})(current, previous);
