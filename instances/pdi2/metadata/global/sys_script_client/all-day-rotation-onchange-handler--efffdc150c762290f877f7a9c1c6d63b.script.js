function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    ScriptLoader.getScripts('OnCallRosterFieldUpdates.jsdbx', function() {
        rosterUpdates(g_form.getValue("rotation_interval_type"), newValue, g_form.getValue("rotation_start_dom_type"));
    });
}
