(function executeRule(current, previous /*null when async*/) {

	//find the run for this schedule whose order is the greatest,
	//increment it by 100, and set it to current.order
	var gr = new GlideRecord('sys_atf_schedule_run');
	gr.addQuery('schedule', current.schedule);
	gr.orderByDesc('order');
	gr.query();
	if (gr.next())
		current.order = gr.order + 100;
	else
		current.order = 100;

})(current, previous);
