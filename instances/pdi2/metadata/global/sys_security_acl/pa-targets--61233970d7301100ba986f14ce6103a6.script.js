if (gs.hasRole('pa_admin') || gs.hasRole('pa_target_admin') || gs.hasRole('pa_power_user'))
	answer = new SNC.PADomainUtils().isWriteable("pa_targets", current.sys_id);

else
	answer = (gs.isInteractive() && gs.nil(current.indicator));
