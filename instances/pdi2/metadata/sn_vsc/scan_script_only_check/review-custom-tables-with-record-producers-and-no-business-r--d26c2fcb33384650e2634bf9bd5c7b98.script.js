(function (finding) {
    var gr = new GlideRecord('sys_db_object');
    gr.addEncodedQuery('nameSTARTSWITHu_^ORnameSTARTSWITHx_^sys_scope!=global^ORsys_scope=NULL');
    gr.query();
    
    while (gr.next()) {
        var table = gr.name.toString();
        var recordProducer = new GlideRecord('sc_cat_item_producer');
        recordProducer.query('table_name', table);
        if (recordProducer.next()) {
            var businessRule = new GlideRecord('sys_script');
            businessRule.addQuery('collection', table);
            businessRule.addActiveQuery();
            businessRule.query();
            if (!businessRule.next()) {
                finding.setCurrentSource(gr);
                finding.setValue('finding_details', 'The table '+  table + ' contains a Record Producer named: '+ recordProducer.name.toString() + ':' + recordProducer.sys_id.toString() + '. However, there is no business rule associated with it.');
                finding.increment();
            }
    
        }
    }

})(finding);
