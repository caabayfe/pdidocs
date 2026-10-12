if (GlideSession.get().getProperty('performanceBypass') === 'true') {
	answer = true;
} else if (!current.isValid()) {
	answer = true;
} else if (gs.hasRole('admin,dashboard_admin')) {
	answer = true;
} else if (gs.hasRole('pa_admin,pa_power_user')) {
	answer = current.canWrite();
} else {
	answer = false;
}
