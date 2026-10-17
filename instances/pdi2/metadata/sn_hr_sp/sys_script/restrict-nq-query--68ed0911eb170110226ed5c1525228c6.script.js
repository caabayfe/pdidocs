(function executeRule(current, previous /*null when async*/) {

	if(current.conditions.toString().contains('^NQ')){
		gs.addErrorMessage(gs.getMessage("New Criteria not supported for condition"));
		current.setAbortAction(true);
	}
})(current, previous);
