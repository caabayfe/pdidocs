answer = new SNC.PADomainUtils().isWriteable("pa_target_values", current.sys_id);

if (!gs.hasRole('pa_admin') && !gs.hasRole('pa_target_admin') && !gs.hasRole('pa_power_user'))
	answer = answer && (new SNC.PATarget(current.target).canWrite());
