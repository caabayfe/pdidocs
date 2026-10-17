function onBefore(current, previous) {
	//This function will be automatically called when this rule is processed.
	// sets all_day true if and only if time goes from 00:00:00 to 23:59:59
	var startDateTime = getScheduleDateTime(current.start_date_time, current.schedule.time_zone);
	var endDateTime = getScheduleDateTime(current.end_date_time, current.schedule.time_zone);
	var startTime = timeToString(startDateTime);
	var endTime = timeToString(endDateTime);
	var timeFormat = gs.getProperty('glide.sys.time_format');
	var omitSecond = timeFormat.startsWith('HH:mm') && !(timeFormat.startsWith('HH:mm:ss'));

	if (startTime == '0:0:0' && endTime == '0:0:0' && startDateTime.getMS() < endDateTime.getMS()){
		// special treatment. When endDateTime is 00:00:00, it is converted to 23:59:59 of the previous day
		endDateTime.addSeconds(-1);
		current.setValue('end_date_time', endDateTime.getValueInternal());
		current.all_day = true;
	}else
		current.all_day = omitSecond ? (startTime == '0:0:0' && endTime == '23:59:0') : (startTime == '0:0:0' && endTime == '23:59:59');
}

function getScheduleDateTime(dateTimeValue, timezone) {
	var scheduleDateTime = new GlideScheduleDateTime();
	scheduleDateTime.setValue(dateTimeValue);
	if (!scheduleDateTime.isFloating())
		scheduleDateTime.convertTimeZone(gs.getSession().getTimeZone(), timezone);
	return scheduleDateTime;
}

function timeToString(date){
	var dateCal = date.getCal();
	return '' + dateCal.get(11 /* hours */) + ':' + dateCal.get(12 /* minutes */) + ':' + dateCal.get(13 /* seconds */);
}
