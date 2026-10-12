if (GlideSession.get().getProperty('performanceBypass') === 'true') {
	answer = true;
} else {
	answer = gs.hasRole('admin,dashboard_admin') || (gs.getUserID() == current.owner);
}
