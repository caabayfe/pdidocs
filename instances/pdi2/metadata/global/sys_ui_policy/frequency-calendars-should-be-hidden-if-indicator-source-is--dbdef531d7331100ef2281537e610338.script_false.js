function onCondition() {
	var calendars = g_form.getValue('calendar');
	var calendar_freq = g_form.getValue('calendar_freq');
	var frequency = g_form.getValue('frequency');
	g_form.setDisplay('calendar', true);
	if (calendars == 'standard' || calendars == '') {
		g_form.setMandatory('calendar_freq', false);
		g_form.setDisplay('calendar_freq', false);
		g_form.setDisplay('frequency', true);
	} else {
		g_form.setDisplay('calendar_freq', true);
		g_form.setMandatory('calendar_freq', true);
		g_form.setDisplay('frequency', false);
	}
}
