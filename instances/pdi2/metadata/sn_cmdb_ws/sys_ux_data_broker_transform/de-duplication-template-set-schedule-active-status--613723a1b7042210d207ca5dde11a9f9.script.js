function transform(input) {
	var scheduleId = input.scheduleId;
	var status = input.status;
	var results = {
		"scheduleId" : scheduleId,
		"status" : status
	};
	try {
		new DeduplicationTemplateScheduleService().activateTemplateSchedule(scheduleId, status);
		results.error = false;
	} catch(e) {
		results.error = true;
	}
	return results;
}
