(function executeRule(current, previous /*null when async*/) {

	var start = new GlideTime();
	start.setValue(current.window_start);
	var end = new GlideTime();
	end.setValue(current.window_end);

	// End time can be before the start time, it will be interpreted as occurring the next day by GlideTime
	if (start.compareTo(end) == 0) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Time window start time needs to be different than the end time"));
	}

})(current, previous);
