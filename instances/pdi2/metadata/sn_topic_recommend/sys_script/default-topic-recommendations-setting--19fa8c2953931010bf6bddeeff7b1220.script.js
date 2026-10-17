(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('sn_topic_recommend_default_setting');
    gr.addQuery('data_source', current.table);
    gr.addQuery('taxonomy', current.model);
    gr.query();
    if (!gr.next()) {
        var ngr = new GlideRecord('sn_topic_recommend_default_setting');
		ngr.setValue('data_source',current.getValue('table'));
		ngr.setValue('taxonomy', current.getValue('model'));
		ngr.setValue('field_to_analyze', current.getValue('field'));
		ngr.setValue('filter_by', current.getValue('filter'));
		ngr.insert();
    }

})(current, previous);
