(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage('Filtered/Scripted List must be a top-level Menu Item.'));
	current.setAbortAction(true);

})(current, previous);
