(function executeRule(current, previous /*null when async*/) {
	if (current.isValidField('attachment_limit') && current.getValue('attachment_limit') < 0) {
		gs.addErrorMessage(gs.getMessage('Attachment Limit cannot be a negative number'));
		current.setAbortAction(true);
	}
})(current, previous);
