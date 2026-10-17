function onLoad() {
    ScriptLoader.getScripts('OnCallRosterFieldUpdates.jsdbx', function() {
        rosterUpdates(g_form.getValue("rotation_interval_type"), g_form.getValue("rotation_all_day"), g_form.getValue("rotation_start_dom_type"));
    });
    if (g_scratchpad.isShiftOnOldEngine) {
        g_form.removeOption('rotation_interval_type', 'monthly');
    }
}
