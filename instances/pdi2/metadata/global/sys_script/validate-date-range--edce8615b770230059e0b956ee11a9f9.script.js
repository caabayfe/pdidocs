(function executeRule(current, previous /*null when async*/) {

	var message = {
		time_off: gs.getMessage('time off'),
		time_off_in_approval: gs.getMessage('time off in approval'),
		time_off_rejected: gs.getMessage('time off rejected'),
		coverage: gs.getMessage('coverage'),
		extra_time: gs.getMessage('extra time')
	};

	var maxDateRangeDaysDuration;
	var type;
	if (current.type == 'time_off' || current.type == 'time_off_in_approval' || current.type == 'time_off_rejected') {
		maxDateRangeDaysDuration = parseInt(gs.getProperty('com.snc.on_call_rotation.calendar_span.max_time_off_days', '365'));
		type = current.type;
	}
	else {
		maxDateRangeDaysDuration = parseInt(gs.getProperty('com.snc.on_call_rotation.calendar_span.max_date_range_days', '30'));
		if (current.type == 'on_call' && JSUtil.nil(current.roster))
			type = 'extra_time';
		else
			type = 'coverage';
	}

	var startDateTime = getScheduleDateTime(current.start_date_time, current.schedule.time_zone);
	var endDateTime = getScheduleDateTime(current.end_date_time, current.schedule.time_zone);
	var coverageDateDiff = gs.dateDiff(startDateTime, endDateTime, true);
	if (JSUtil.nil(coverageDateDiff)) {
		gs.addErrorMessage(gs.getMessage("Invalid {0} spans", message[type]));
		current.setAbortAction(true);
	}
	var providedCoverageDuration = parseInt(coverageDateDiff / (24 * 60 * 60));
	if (providedCoverageDuration > maxDateRangeDaysDuration) {
		gs.addErrorMessage(gs.getMessage("Can not provide {0} for more than {1} consecutive days.", [message[type], maxDateRangeDaysDuration +""]));
		current.setAbortAction(true);
	}

	function getScheduleDateTime(dateTimeValue, timezone) {
		var scheduleDateTime = new GlideScheduleDateTime();
		scheduleDateTime.setValue(dateTimeValue);
		if (!scheduleDateTime.isFloating())
			scheduleDateTime.convertTimeZone(gs.getSession().getTimeZone(), timezone);
		return scheduleDateTime;
	}
})(current, previous);
