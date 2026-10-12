(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Procurement plugin needs to be activated if Vendor is selected in Restocking option field"));
	current.setAbortAction(true);

})(current, previous);
