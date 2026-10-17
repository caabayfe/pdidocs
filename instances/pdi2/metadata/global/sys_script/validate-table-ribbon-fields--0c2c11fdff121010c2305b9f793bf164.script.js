(function executeRule(current, previous /*null when async*/) {
	if (current.ribbon.nil()) {
		gs.addErrorMessage(gs.getMessage("Missing required Ribbon Setting."));
		current.setAbortAction(true);
		return;
	}
	var ribbon = current.ribbon.getRefRecord();
	if (ribbon.nil() || !ribbon.isValidRecord()) {
		gs.addErrorMessage(gs.getMessage("Invalid Ribbon Setting reference {0}." [current.ribbon]));
		current.setAbortAction(true);
		return;
	}
	if (current.table != ribbon.table)
		current.setValue('table', ribbon.table);
})(current, previous);
