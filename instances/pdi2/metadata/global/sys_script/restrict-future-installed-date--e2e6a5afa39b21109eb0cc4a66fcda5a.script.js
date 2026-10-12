(function executeRule(current, previous /*null when async*/) {

	var currentDate = new GlideDateTime();
	var installedDate = new GlideDateTime(current.getValue("install_date"));
	if (currentDate < installedDate){
		gs.addErrorMessage(gs.getMessage('The installed date and time cannot be in the future.'));
		current.setAbortAction(true);
	}

})(current, previous);
