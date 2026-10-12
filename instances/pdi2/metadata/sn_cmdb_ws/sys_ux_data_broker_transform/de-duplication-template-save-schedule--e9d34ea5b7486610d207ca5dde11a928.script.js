function transform(input) {
	var result = {
		error: null,
		status : 'success',
		message : null
	};

	var schedule = {
		'sys_id': input.schedule.sys_id,
		'active': input.schedule.active,
		'run_type': input.schedule.run_type
	};

   switch (schedule.run_type) {
        case 'daily':
			setTime(schedule,input);
            break;
        case 'weekly':
			setTime(schedule,input);
            schedule.run_dayofweek = input.schedule.run_dayofweek;
            break;
        case 'monthly':
			setTime(schedule,input);
			schedule.run_dayofmonth = input.schedule.run_dayofmonth;
            break;
        case 'periodically':
			var run_period = input.schedule.run_period_days + " " + input.schedule.run_period_time;
			var dur = new GlideDuration(run_period);
			schedule.run_period = dur.getByFormat('yyyy-MM-dd HH:mm:ss');
			schedule.run_start = input.schedule.run_start;
            break;
    }

	var res;
	try {
		if(input.schedule.sys_id) {
			// update schedule		
			res = new DeduplicationTemplateScheduleService().updateTemplateSchedule(input.schedule.sys_id, schedule);
		} else {
			// create schedule
			res = new DeduplicationTemplateScheduleService().createTemplateSchedule(input.templateID, schedule);
		}
	} catch (e) {
		result.error = true;
		result.status = 'failed';
		result.message = e.message;
	}
	return result;

    function setTime(schedule, input) {

		if(input.schedule.time_zone){
			schedule.time_zone = input.schedule.time_zone;
			schedule.entered_time = input.schedule.entered_time;
		}else {
			schedule.run_time = input.schedule.run_time;
		}
    }
}
