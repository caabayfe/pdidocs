answer = new SNC.PADomainUtils().isWriteable("pa_score_notes", current.sys_id);

if (!gs.hasRole('pa_admin') && !gs.hasRole('pa_power_user') && !gs.hasRole('pa_viewer') && !gs.hasRole('pa_contributor'))
	answer = answer && (gs.getUser().getID() == current.user);
