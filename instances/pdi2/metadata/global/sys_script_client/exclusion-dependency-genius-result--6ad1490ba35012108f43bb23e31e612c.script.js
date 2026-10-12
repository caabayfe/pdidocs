function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    if (newValue == 'true') {
        if (g_form.getValue('exclude_attachments_in_now_assist_genius_results') == 'false') {
            g_form.setValue('exclude_attachments_in_now_assist_genius_results', 'true');
            g_form.addInfoMessage(getMessage('Attachments in Now Assist Genius Results is excluded when Now Assist Genius Results is excluded'));
        }
        if (g_form.getValue('exclude_in_regular_search') == 'true') {
            g_form.setValue('exclude_in_regular_search', 'false');
            g_form.addInfoMessage(getMessage('Either Regular Search Result or Now Assist Genius Result should be included.'));
        }
        g_form.setDisabled('exclude_attachments_in_now_assist_genius_results', true);
        g_form.setDisabled('exclude_in_regular_search', true);
    } else {
        var ssGr = new GlideRecord('ais_search_source');
        ssGr.addQuery('sys_id', g_form.getValue('search_source'));
        ssGr.query();
        if (ssGr.next()) {
            var dsGr = new GlideRecord('ais_datasource');
            dsGr.addQuery('source', ssGr.getValue('datasource'));
            dsGr.query();
            if (dsGr.next()) {
                if (dsGr.getValue('type') == 'external') {
                    g_form.setDisabled('exclude_attachments_in_now_assist_genius_results', true);
                    g_form.setDisabled('exclude_in_regular_search', false);
                    return;
                }
            }
        }
        g_form.setDisabled('exclude_attachments_in_now_assist_genius_results', false);
        g_form.setDisabled('exclude_in_regular_search', false);
    }
}
