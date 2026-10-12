(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage('{0} needs to be a business service or technology management service.', [current.getElement('parent').getED().getLabel()]));
	current.setAbortAction(true);
})(current, previous);
