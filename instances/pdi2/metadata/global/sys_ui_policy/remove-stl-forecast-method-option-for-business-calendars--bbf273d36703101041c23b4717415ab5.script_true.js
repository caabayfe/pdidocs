function onCondition() {
	// If the calendars is not standard calendar. then we need to remove the STL option.
	var stlOptionControl = g_form.getOption('forecast_method', '4');
	if (stlOptionControl && !stlOptionControl.hasAttribute('disabled'))
		stlOptionControl.disabled = true;
}
