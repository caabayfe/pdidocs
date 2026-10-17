(function executeRule(current, previous /*null when async*/) {
	var endTimeDay = current.end_time_day;
	if ((endTimeDay == 0) && (current.getValue('start_time') > current.getValue('end_time'))) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("End time should be greater than Start time."));
		return;
	}
	else if (endTimeDay > 0) {
		var minGapBtwDays = endTimeDay;
		if (current.getValue('start_time') < current.getValue('end_time'))
			minGapBtwDays+=1;
		validateSelfOverlap(current.days + '', minGapBtwDays);
	}
	
	function validateSelfOverlap(daysOfWeek, minGap) {
		for (var i = 0; i < daysOfWeek.length; i++) {
			if ((daysOfWeek[i+1] ? parseInt(daysOfWeek[i+1]) : parseInt(daysOfWeek[0])+7) - parseInt(daysOfWeek[i]) < minGap) {
				current.setAbortAction(true);
				gs.addErrorMessage(gs.getMessage("The Repeat on and time range results in overlapping events. Specify a valid range and Repeat on to avoid overlap."));
				return;
			}
		}
	}

})(current, previous);
