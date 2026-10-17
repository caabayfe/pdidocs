function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var ssGr = new GlideRecord('ais_search_source');
    ssGr.addQuery('sys_id', newValue);
    ssGr.query();
    if (ssGr.next()) {
        var dsGr = new GlideRecord('ais_datasource');
        dsGr.addQuery('source', ssGr.getValue('datasource'));
        dsGr.query();
        if (dsGr.next()) {
            if (dsGr.getValue('type') == 'external') {
                g_form.setDisplay('exclude_attachments_in_now_assist_genius_results', false);
                g_form.setValue('exclude_attachments_in_now_assist_genius_results', 'true');
            } else {
                g_form.setDisplay('exclude_attachments_in_now_assist_genius_results', true);
                if (g_form.getValue('exclude_in_now_assist_genius_results') == 'false')
                    g_form.setDisabled('exclude_attachments_in_now_assist_genius_results', false);
            }
        }
    }
}
