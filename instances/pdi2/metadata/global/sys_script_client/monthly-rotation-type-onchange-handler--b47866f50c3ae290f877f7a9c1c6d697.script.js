function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	ScriptLoader.getScripts('OnCallRosterFieldUpdates.jsdbx', function() {
		rosterUpdates(g_form.getValue("rotation_interval_type"),g_form.getValue("rotation_all_day"), newValue);
	});

}
