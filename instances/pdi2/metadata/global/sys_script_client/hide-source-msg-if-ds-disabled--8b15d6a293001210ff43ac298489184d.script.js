function onLoad() {
    if (g_form.getValue('is_mlb_enabled') === 'true' || g_form.getValue('is_mlb_supported') === 'true') {
        var gr = new GlideRecord('pa_cdc_indicator_analytics_mapping');
        gr.addQuery('indicator', g_scratchpad.id);
        gr.query();
        if (gr.next()) {
            var relatedSourceId = gr.getValue('mlb_related_source');
            var grSource = new GlideRecord('pa_dm_analytics_source');
            grSource.addQuery('id', relatedSourceId);
            grSource.query();
            if (grSource.next()) {
                var link = "<a href='/pa_dm_analytics_source.do?sys_id=" + grSource.sys_id + "' target='_blank'>View details</a>";
                var message = new GwtMessage().getMessage('This indicator is linked to a Data Snapshots source. {0}', link);
                $j("#ds-source-link").html(message);
            } else $('ds-source-link').up().hide();
        } else $('ds-source-link').up().hide();
    } else $('ds-source-link').up().hide();
}
