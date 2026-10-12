if (current.benchmarking === 'true')
	answer = false;
else if (gs.getProperty('com.snc.pa.elevate_pa_admin_privileges', true) === 'true')
	answer = true;
else
	answer = gs.hasRole('admin');
