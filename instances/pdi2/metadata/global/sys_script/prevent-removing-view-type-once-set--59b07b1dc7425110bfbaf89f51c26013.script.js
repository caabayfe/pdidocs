(function executeRule(current, previous /*null when async*/) {
	var fields = PDConstants.FIELDS;
	if (
		!previous.getElement(fields.VIEW_TYPE).nil()
		&& current.getElement(fields.VIEW_TYPE).nil()
	) {
		gs.addErrorMessage(
			gs.getMessage("Cannot remove process View Type")
		);
		current.setAbortAction(true);
		return;
	}
})(current, previous);
