function onCondition() {
	
	var optionsForecastMethod = g_form.getOptionControl('forecast_method');
	var stlOptionControl = g_form.getOption('forecast_method', '4');

	if (stlOptionControl && stlOptionControl.hasAttribute('disabled'))
		g_form.enableOption(optionsForecastMethod, stlOptionControl.value, stlOptionControl.label);

}
