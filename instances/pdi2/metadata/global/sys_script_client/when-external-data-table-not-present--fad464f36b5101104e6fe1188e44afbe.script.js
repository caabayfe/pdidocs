function onLoad() {
    if (!g_scratchpad.isExternalDataTablePresent) {
        g_form.removeOption("source_type", "EXTERNAL_DATA");
    }
}
