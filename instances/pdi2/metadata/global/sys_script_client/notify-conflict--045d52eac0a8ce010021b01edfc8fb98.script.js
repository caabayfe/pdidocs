function onLoad() {
	if (g_form.getValue('conflict_status') === 'Conflict') {
		g_form.addWarningMessage(new GwtMessage().getMessage("Scheduling conflict detected. Use the <a href='javascript:void(0);' onclick='openNextAvailableTime()'>Scheduling Assistant</a> to avoid conflicts."), "conflict_warn_status");
	}
}
