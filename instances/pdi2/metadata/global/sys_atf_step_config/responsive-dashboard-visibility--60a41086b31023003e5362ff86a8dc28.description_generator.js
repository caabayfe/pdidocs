(function generateDescription() {
   var isVisible = step.inputs.assert_type;
	var assertIsVisible = (isVisible == 'dashboard_is_visible');
	
	if (assertIsVisible)
		return gs.getMessage("Confirm the dashboard '{0}' is visible",
							 step.inputs.dashboard_id.getDisplayValue());
	else
		return gs.getMessage("Confirm the dashboard '{0}' is not visible",
							 step.inputs.dashboard_id.getDisplayValue());
})(step);
