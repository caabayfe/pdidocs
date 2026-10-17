function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue == 'true') {
        g_form.setDisabled('exclude_in_now_assist_genius_results', true);
        if (g_form.getValue('exclude_in_now_assist_genius_results') == 'true') {
            g_form.setValue('exclude_in_now_assist_genius_results', 'false');
            g_form.addInfoMessage(getMessage('Either Regular Search Result or Now Assist Genius Result should be included.'));
        }
    } else {
        g_form.setDisabled('exclude_in_now_assist_genius_results', false);
    }


}
