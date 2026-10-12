if (gs.hasRole('pa_admin') || gs.hasRole('pa_target_admin') || gs.hasRole('pa_power_user'))
	answer = true;

else
	answer = (gs.isInteractive() && gs.nil(current.indicator));
