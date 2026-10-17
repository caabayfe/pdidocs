if (current.isNewRecord()) {
	answer = new OnCallSecurityNG().rotaMgrAccess(current.rota.group);
} else {
	answer = gs.hasRole('maint');
}
