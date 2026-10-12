if (gs.hasRole('pa_admin') || gs.hasRole('pa_target_admin') || gs.hasRole('pa_power_user'))
	answer = true;
else
	answer = new SNC.PATarget(current.target).canRead();
