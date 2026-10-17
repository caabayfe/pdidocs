(function executeRule(current, previous /*null when async*/) {
	if (current.schedule_type == 'simple') {
		current.schedule_template = '';
		if (current.all_day) {
			current.start_time = 0;
			current.end_time = 0;
			current.end_time_day = 0;
		}
		if (!current.specify_holiday)
			current.holiday_schedule = '';
	}
	else if (current.schedule_type == 'schedule_template') {
		current.all_day = false;
		current.start_time = 0;
		current.end_time = 0;
		current.end_time_day = 0;
		current.days = '';
		current.time_zone = '';
		current.specify_holiday = false;
		current.holiday_schedule = '';
	}
})(current, previous);
