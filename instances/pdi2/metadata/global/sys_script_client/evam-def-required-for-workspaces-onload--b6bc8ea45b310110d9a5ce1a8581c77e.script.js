function onLoad() {
    var SEARCH_ENGINE_FIELD = 'search_engine';
    var EVAM_DEFINITION_FIELD = 'evam_definition';
    if (g_scratchpad.isUsedByWorkspace && g_form.getValue(SEARCH_ENGINE_FIELD) == 'ai_search') {
        g_form.setMandatory(EVAM_DEFINITION_FIELD, true);
    } else {
        g_form.setVisible(EVAM_DEFINITION_FIELD, false);
    }
}
