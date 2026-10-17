SNC.PAUtils.isPremium() && new SNC.PADomainUtils().isWriteable("pa_breakdowns", current.sys_id) && (current.type != 3 || gs.hasRole('pa_power_user') || gs.hasRole('pa_admin'));
