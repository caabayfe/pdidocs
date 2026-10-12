(function executeRule(current, previous /*null when async*/) {

	//When any schedule runs are changed, update the description of its associated schedule
	var scheduleGR = new GlideRecord('sys_atf_schedule');
	if (!scheduleGR.get(current.schedule))
		return;

	var scheduleDescription = '';
	var scheduleRunGR = new GlideRecord('sys_atf_schedule_run');
	scheduleRunGR.addQuery('schedule', current.schedule);
	scheduleRunGR.orderBy('order');
	scheduleRunGR.query();
	if (scheduleRunGR.hasNext())
		scheduleDescription = gs.getMessage('This schedule will perform the following actions:');

	while (scheduleRunGR.next())
		scheduleDescription += "\n\n" + scheduleRunGR.description;

	scheduleGR.description = scheduleDescription;
	scheduleGR.update();

})(current, previous);
