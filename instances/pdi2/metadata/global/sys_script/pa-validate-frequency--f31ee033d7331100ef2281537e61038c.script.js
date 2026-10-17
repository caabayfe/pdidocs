var ele = current.getElement('cube');
if (JSUtil.notNil(ele)) {
	var cube = ele.getRefRecord();
	if (cube.isValidRecord()) {
		var calendar = cube.getValue('calendar');
		var freq = cube.getValue('frequency');
		var calendar_freq = cube.getValue('calendar_freq');

		// Update Calendar, If its empty value, implies standard calendar
		if (JSUtil.nil(calendar))
			calendar = 'standard';
		if (JSUtil.nil(current.getValue('calendar')))
			current.calendar = 'standard';
		var m = '';
		if (calendar != current.calendar) {
			m = gs.getMessage('{0} should be the same as Indicator Source {0}', 'Calendars');
			abortAndError(m, current);
		} else if (calendar == 'standard' && current.frequency != freq) {
			m = gs.getMessage('{0} should be the same as Indicator Source {0}', 'Frequency');
			abortAndError(m, current);
		} else if (calendar != 'standard' && current.calendar_freq != calendar_freq) {
			m = gs.getMessage('{0} should be the same as Indicator Source {0}', 'Calendar Frequency');
			abortAndError(m, current);
		}
	}
}

function abortAndError(msg, cr) {
	gs.addErrorMessage(msg);
	cr.setAbortAction(true);
}
