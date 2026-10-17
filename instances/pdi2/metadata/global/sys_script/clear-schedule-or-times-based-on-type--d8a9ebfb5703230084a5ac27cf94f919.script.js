(function executeRule(current, previous /*null when async*/) {

	if (current.schedule_type == 'simple') {
		if (JSUtil.nil(current.start_time)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Invalid start time"));
		}
		else if (JSUtil.nil(current.end_time)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Invalid end time"));
		}
		else {
			current.schedule = '';
		}
	}
	else if (current.schedule_type == 'schedule') {
		if (JSUtil.nil(current.schedule)) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("Invalid schedule"));
		}
		else {
			current.start_time = '';
			current.end_time = '';
		}
	}
		

})(current, previous);
