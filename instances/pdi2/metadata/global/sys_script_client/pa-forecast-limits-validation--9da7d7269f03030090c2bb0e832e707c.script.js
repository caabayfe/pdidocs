function onSubmit() {
	var lowerLimitStr = g_form.getValue('forecast_lower_limit');
	var upperLimitStr = g_form.getValue('forecast_upper_limit');

	if(lowerLimitStr == '' || upperLimitStr == '')
		return true;

	var lowerLimit = g_form.getDecimalValue('forecast_lower_limit');
	var upperLimit = g_form.getDecimalValue('forecast_upper_limit');

	if(lowerLimit < upperLimit)
		return true;

	g_form.showFieldMsg('forecast_lower_limit', getMessage('Forecast lower limit should be less than the uppper limit'), 'error');
	g_form.showFieldMsg('forecast_upper_limit', getMessage('Forecast upper limit should be greater than the lower limit'), 'error');
	return false;
}
