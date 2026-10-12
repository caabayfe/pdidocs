function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.setValue('finding_def', g_scratchpad.findingDefSysId);
    }
}
