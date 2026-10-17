function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var incidentState = JSON.parse(g_scratchpad.incidentState);
    var mandatory = false;
    if (g_form.hasField('incident_state')) {
        var incident_state = g_form.getValue('incident_state');
        mandatory = incident_state == incidentState.RESOLVED || incident_state == incidentState.CLOSED;
    }
    if (g_form.hasField('state')) {
        var state = g_form.getValue('state');
        mandatory = state == incidentState.RESOLVED || state == incidentState.CLOSED;
    }
    g_form.setSectionDisplay('resolution', mandatory);
}
