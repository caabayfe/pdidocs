function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    ScriptLoader.getScripts('OnCallRosterFieldUpdates.jsdbx', function() {
        rosterUpdates(newValue, g_form.getValue("rotation_all_day"), g_form.getValue("rotation_start_dom_type"));
    });
}
