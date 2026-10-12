function onCondition() {

	var cubeId = g_form.getValue('cube');
	var cubeRecord = new GlideRecord('pa_cubes');
	cubeRecord.get(cubeId);

	var cubeCalendar = cubeRecord.getValue('calendar');
	var cubeCalendarFreq = cubeRecord.getValue('calendar_freq');
	var cubeFrequency = cubeRecord.getValue('frequency');

	// Override the empty value with standard calendar, default value
	if (cubeCalendar == '')
		cubeCalendar = 'standard';
	
	g_form.setValue('calendar', cubeCalendar);
	g_form.setValue('frequency', cubeFrequency);
	if (cubeCalendarFreq != '')
		g_form.setValue('calendar_freq', cubeCalendarFreq);

	// Don't show this fields in form, if the indicator source is not empty.
	g_form.setDisplay('calendar', false);
	g_form.setDisplay('frequency', false);

	g_form.setMandatory('calendar_freq', false);
	g_form.setDisplay('calendar_freq', false);

}
