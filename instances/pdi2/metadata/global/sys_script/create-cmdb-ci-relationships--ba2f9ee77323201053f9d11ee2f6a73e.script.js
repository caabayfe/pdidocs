(function executeRule(current, previous /*null when async*/ ) {

	var dependsOnRel = gs.getProperty('cmdb.depends_constant');
	
    var gr = new GlideRecord('cmdb_rel_ci');
    gr.addQuery('parent', current.getValue('business_process'));
    gr.addQuery('child', current.getValue('cmdb_ci'));
    gr.addQuery('type', dependsOnRel);
    gr.setLimit(1);
    gr.query();
    if (current.operation() == 'insert') {
        if (!gr.next()) {
            gr.initialize();
            gr.setValue('parent', current.getValue('business_process'));
            gr.setValue('child', current.getValue('cmdb_ci'));
            gr.setValue('type', dependsOnRel);
            gr.insert();
        }
    } else {
        if (gr.next() && current.operation() == 'delete')
            gr.deleteRecord();
    }

})(current, previous);
