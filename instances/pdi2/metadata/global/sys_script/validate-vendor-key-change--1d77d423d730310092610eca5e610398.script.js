function onBefore(current, previous) {
	if (!gs.hasRole('maint')) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Vendor key cannot be changed by non-maint'));
	}
}
