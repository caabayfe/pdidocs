(function() {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', 'cxs_rel_doc_detail');
	gr.addQuery('element', 'cxs_relevant_doc');
	gr.addNullQuery('reference_cascade_rule');
	gr.setWorkflow(false);
	gr.query();
	if (gr.next()) {
		gr.setValue('reference_cascade_rule', 'delete');
		gr.setWorkflow(false);
		gr.update();
	}
    return;
})();
