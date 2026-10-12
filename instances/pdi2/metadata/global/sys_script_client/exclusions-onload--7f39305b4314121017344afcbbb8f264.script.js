function onLoad() {
    var regularExclusion = g_form.getValue('exclude_in_regular_search');
    var grExclusion = g_form.getValue('exclude_in_now_assist_genius_results');
    var attachmentExclusion = g_form.getValue('exclude_attachments_in_now_assist_genius_results');

    if (regularExclusion == 'true')
        g_form.setDisabled('exclude_in_now_assist_genius_results', true);

    if (grExclusion == 'true') {
        g_form.setDisabled('exclude_in_regular_search', true);
        g_form.setDisabled('exclude_attachments_in_now_assist_genius_results', true);
    }

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
            }
        }
    }

}
