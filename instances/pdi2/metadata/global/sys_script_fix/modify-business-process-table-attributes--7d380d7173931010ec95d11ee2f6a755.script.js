function customerUpdated(recordName) {
    var grRec = new GlideRecord('sys_update_xml');
    grRec.addQuery('name', recordName);
    grRec.query();
    return grRec.hasNext();
}

var gr = new GlideRecord('sys_dictionary');
gr.addQuery('sys_update_name', 'sys_dictionary_cmdb_ci_business_process_parent');
gr.query();

if (gr.next() && !customerUpdated('sys_dictionary_cmdb_ci_business_process_parent')) {
    var attributes = gr.getValue('attributes');
    gr.setWorkflow(false);
    if (gr.getValue('attributes').indexOf('tree_picker') == -1)
        gr.setValue('attributes', attributes + ',tree_picker=true');
    gr.setValue('use_reference_qualifier', 'advanced');
    gr.setValue('reference_qual', "javascript: 'sys_idNOT IN'+new global.BusinessProcessUtils().getChildren(current);");
    gr.update();
}

gr = new GlideRecord('sys_dictionary');
gr.addQuery('sys_update_name', 'sys_dictionary_cmdb_ci_business_process_next_review_date');
gr.query();

if (gr.next() && !customerUpdated('sys_dictionary_cmdb_ci_business_process_next_review_date')) {
    gr.setWorkflow(false);
    gr.read_only = true;
    gr.update();
}
