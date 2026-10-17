(function executeRule(current, previous /*null when async*/) {

	if (previous.value == current.value)
		return;

	var gr = new GlideRecord('sys_properties');
	gr.addQuery('name', 'sn_atf.schedule.enabled');
	gr.query();
	if (!gr.next())
		return;

    var schedulePropertyValue = gr.getValue('value');
    gr.setWorkflow(false); // forcibly turn on or off the schedule property
	if (previous.value == 'true' && current.value == 'false') {
		if (schedulePropertyValue == 'true') {
			gr.setValue('value', 'false');
			gr.update();
			gs.addInfoMessage(gs.getMessage('Disabled scheduled suites because test execution was disabled'));
		}
	} else if (previous.value == 'false' && current.value == 'true') {
		if (schedulePropertyValue == 'false') {
			gr.setValue('value', 'true');
			gr.update();
			gs.addInfoMessage(gs.getMessage('Enabled scheduled suites because test execution was enabled'));
		}
	}

})(current, previous);
