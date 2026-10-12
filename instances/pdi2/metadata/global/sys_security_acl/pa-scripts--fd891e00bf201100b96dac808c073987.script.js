if (!new SNC.PADomainUtils().isWriteable("pa_scripts", current.sys_id) || gs.getProperty('com.snc.pa.elevate_pa_admin_privileges', true) === 'false')
	answer = false;
else 
	answer = gs.hasRole('pa_data_collector');
