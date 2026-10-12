(function executeRule(current, previous /*null when async*/ ) {
	if (current == null )
		return;

	var advancedSchedulerUtils = new AdvancedSchedulerUtils();
	if(!advancedSchedulerUtils.isTimeZoneValid(current.time_zone)){
		gs.addErrorMessage(gs.getMessage("The selected time zone is not recognized."));
		current.setAbortAction(true);
		return;
	}

	advancedSchedulerUtils.adjustToTimeZone(current.entered_run_start, current.run_start, current.time_zone);
	advancedSchedulerUtils.adjustToTimeZone(current.entered_run_end, current.run_end, current.time_zone);
})(current, previous);
