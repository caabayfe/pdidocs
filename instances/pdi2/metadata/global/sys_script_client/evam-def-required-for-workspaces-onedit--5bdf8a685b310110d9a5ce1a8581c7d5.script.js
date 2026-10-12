function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    var EVAM_DEFINITION_FIELD = 'evam_definition';
    if (oldValue == 'zing' && newValue == 'ai_search') {
        if (g_scratchpad.isUsedByWorkspace) {
            // Make the EVAM Def field required for AIS apps used by workspaces
            g_form.setVisible(EVAM_DEFINITION_FIELD, true);
            g_form.setMandatory(EVAM_DEFINITION_FIELD, true);
        } else {
            g_form.setVisible(EVAM_DEFINITION_FIELD, false);
        }
    } else if (newValue == 'zing') {
        g_form.setMandatory(EVAM_DEFINITION_FIELD, false);
        g_form.hideFieldMsg(EVAM_DEFINITION_FIELD, true);
        g_form.setVisible(EVAM_DEFINITION_FIELD, false);
    }
}
