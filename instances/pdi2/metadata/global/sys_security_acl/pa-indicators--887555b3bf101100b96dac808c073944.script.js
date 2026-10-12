new SNC.PADomainUtils().isWriteable("pa_indicators", current.sys_id) && (current.type != 4 || gs.hasRole('pa_power_user') || gs.hasRole('pa_admin'));
