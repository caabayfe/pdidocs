//refer UI Policy "Show internal transcript on closed chat interactions" for onChange functionality
function onLoad() {
    if ((g_form.getValue('state') == 'closed_complete' || g_form.getValue('state') == 'closed_abandoned') && (g_form.getValue('type') == 'chat' || g_form.getValue('type') == 'messaging')) {
        if (g_form.getValue('internal_transcript').length > 0) {
            g_form.setDisplay('internal_transcript', true);
            g_form.setDisplay('transcript', false);
        } else if (g_form.getValue('transcript').length > 0) {
            g_form.setDisplay('internal_transcript', false);
            g_form.setDisplay('transcript', true);
        } else if ((g_form.getValue('internal_transcript').length == 0) && (g_form.getValue('transcript').length == 0)){
            g_form.setDisplay('internal_transcript', false);
            g_form.setDisplay('transcript', true);
        }
    } else {
        g_form.setDisplay('internal_transcript', false);
        g_form.setDisplay('transcript', false);
    }
}
