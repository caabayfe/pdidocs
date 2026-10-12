(function executeRule(current, previous /*null when async*/) {
	
	gs.addErrorMessage(gs.getMessage('{0} cannot be less than {1}.',[current.end_date.getED().getLabel(),current.start_date.getED().getLabel().toLowerCase()]));
	current.setAbortAction(true);

})(current, previous);
