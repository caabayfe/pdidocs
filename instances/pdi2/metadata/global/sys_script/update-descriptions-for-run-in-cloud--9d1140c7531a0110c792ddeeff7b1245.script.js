(function executeRule(current, previous /*null when async*/) {
	// when the run_in_cloud value changes, iterate through each schedule run and update their descriptions
	var scheduledTestProcessor = new ScheduledTestProcessor();
	var scheduleRunGR = new GlideRecord('sys_atf_schedule_run');
	scheduleRunGR.addQuery('schedule', current.sys_id);
	scheduleRunGR.orderBy('order');
	scheduleRunGR.query();
	var scheduleDescription = gs.getMessage('This schedule will perform the following actions:');
	while (scheduleRunGR.next()) {
		// prevent mulitple updates to this schedule's description. Updating the schedule run record
		// fires a BR that updates the description of the schedule.
		scheduleRunGR.setWorkflow(false);
		scheduledTestProcessor.setScheduleRunDescription(scheduleRunGR);
		scheduleRunGR.update();
		scheduleDescription += "\n\n" + scheduleRunGR.description;
	}

	// manually update the schedule description
	// turn workflow off so this BR doesn't run again
	// (it wouldn't actually run again b/c of condition but the server still complains about it)
	current.description = scheduleDescription;
	current.setWorkflow(false);
	current.update();
})(current, previous);
