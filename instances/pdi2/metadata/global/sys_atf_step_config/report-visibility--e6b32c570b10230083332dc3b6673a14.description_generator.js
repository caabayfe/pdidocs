(function generateDescription(step) {
	var assertType = step.inputs.assert_type;
	var assertCanView = (assertType == 'can_view_report');
	
	if (assertCanView)
		return gs.getMessage("Confirm report '{0}' can be viewed by the test user",
							 step.inputs.report_id.getDisplayValue());
	else
		return gs.getMessage("Confirm report '{0}' cannot be viewed by the test user",
							 step.inputs.report_id.getDisplayValue());
})(step);
