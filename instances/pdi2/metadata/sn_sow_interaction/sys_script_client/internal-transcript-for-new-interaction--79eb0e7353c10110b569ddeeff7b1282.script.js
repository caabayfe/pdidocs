function onLoad() {
    if (g_form.isNewRecord()) {
        g_form.setDisplay('internal_transcript', false);
        g_form.setDisplay('transcript', false);
    }
}
