var gr = new GlideRecord('sys_search_signal_event');
gr.addQuery('search_results', 'CONTAINS', 'genius');
gr.addQuery('sys_created_on', '>=', gs.daysAgo(90));
gr.query();

while (gr.next()) {
    var rawResults = gr.getValue('search_results');
    var resultsJson = JSON.parse(rawResults);

    for (var results in resultsJson.results) {
        var result = resultsJson.results[results];
        if (result.resultType === 'GENIUS') {
            var glideRecord = new GlideRecord('sys_search_signal_genius_result_triggered_event');

            glideRecord.initialize();
            glideRecord.autoSysFields(false);
            glideRecord.setValue('search_signal_event', gr.getUniqueValue());
            glideRecord.setValue('source_table', result.tableName);
            glideRecord.setValue('card_type', result.cardType);
            glideRecord.setValue('result_doc_id', result.id);
            glideRecord.setValue('sys_created_on', gr.getValue('sys_created_on'));
            glideRecord.setValue('sys_created_by', gr.getValue('sys_created_by'));
            glideRecord.setValue('sys_updated_on', gr.getValue('sys_updated_on'));
            glideRecord.setValue('sys_updated_by', gr.getValue('sys_updated_by'));

            glideRecord.insert();
        }
    }
}
