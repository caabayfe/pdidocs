function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    if (newValue === '') {
        g_form.hideFieldMsg('data_snapshot_source');
        return;
    }
    g_form.getReference('data_snapshot_source', showFieldMessage);

    function showFieldMessage(source) {
        if (source.getValue('frequency') == 'daily') {
            var gwt = new GwtMessage();
            var timeZone = source.getValue('run_as_tz');
            var msg = gwt.getMessage("Data is collected daily based on the " + timeZone + " time zone.");
            g_form.showFieldMsg('data_snapshot_source', msg, 'info');
        }
    }
}
