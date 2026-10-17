answer = (SNC.PAIndicator.canRead(current.indicator) && SNC.PABreakdown.canRead(current.breakdown));

if (!gs.hasRole('pa_admin') && !gs.hasRole('pa_target_admin') && !gs.hasRole('pa_power_user'))
	answer = (answer && (gs.getUser().getID() == current.owner));
