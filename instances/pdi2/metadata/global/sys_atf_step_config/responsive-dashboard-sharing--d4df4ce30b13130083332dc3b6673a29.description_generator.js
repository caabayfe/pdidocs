(function generateDescription(step) {
	var assertType = step.inputs.assert_type;
	var assertCanShare = (assertType == 'can_share_dashboard');
	
	if (assertCanShare)
		return gs.getMessage("Confirm the dashboard '{0}' can be shared",
							 step.inputs.dashboard_id.getDisplayValue());
	else
		return gs.getMessage("Confirm the dashboard '{0}' cannot be shared",
							 step.inputs.dashboard_id.getDisplayValue());
})(step);
