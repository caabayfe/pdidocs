if (gs.hasRole('pa_admin') || gs.hasRole('pa_threshold_admin') || gs.hasRole('pa_power_user'))
	answer = true;

else 
	answer = (gs.getUser().getID() == current.owner);
