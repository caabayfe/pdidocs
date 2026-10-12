function onSubmit() {
	var error = false;
	if (!isValidDate()) {
		g_form.showFieldMsg('start', getMessage('\'Start\' date must be before \'End\' date.'), 'error');
		error = true;
	}
	
	showFieldValue();
	return !error;
}

function isValidDate() {
	var end = g_form.getValue('end');
	if (!end)
		return true;

	var endDate = new Date(getDateFromFormat(end), g_user_date_format);
	var startDate = new Date(getDateFromFormat(g_form.getValue('start'), g_user_date_format));

	if (startDate > endDate) {
		g_form.addErrorMessage(getMessage('Error with the following field: Start'));
		return false;
	}

	return true;
}

function showFieldValue() {
	var displayFor = g_form.getValue('show_for');
	if (displayFor === 'specified_users')
		return;
	
	g_form.clearValue('roles');
	g_form.clearValue('group');
}
