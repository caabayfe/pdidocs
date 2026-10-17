function onLoad() {
   //Type appropriate comment here, and begin script below
		var currentCalendarSelected = g_form.getValue("calendar");
	var calendar_freq = g_form.getValue('calendar_freq');
	var frequency = g_form.getValue('frequency');
	if (currentCalendarSelected == 'standard') {
		g_form.setMandatory('calendar_freq', false);
		g_form.setDisplay('calendar_freq', false);
		g_form.setDisplay('frequency', true);
	} else {
		g_form.setDisplay('calendar_freq', true);
		g_form.setMandatory('calendar_freq', true);
		g_form.setDisplay('frequency', false);
	}
   
}
