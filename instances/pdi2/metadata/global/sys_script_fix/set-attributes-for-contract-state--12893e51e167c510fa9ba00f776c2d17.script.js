(function() {
	var gr = new GlideRecord('sys_dictionary');
	if (!gr.isValid()) { return; }
	gr.addQuery('name', 'ast_contract');
	gr.addQuery('element', 'state').addOrCondition('element', 'substate');
	gr.query();
	gs.info('add ignore_filter_on_new=true attribute to state & substate of ast_contract');
	while (gr.next()) {
		var filter = gr.getValue('attributes');
		if (gs.nil(filter)) {
			gr.setValue('attributes', 'ignore_filter_on_new=true');
			gr.update();
		} else if (!filter.includes('ignore_filter_on_new')) {
			gr.setValue('attributes', filter + ',ignore_filter_on_new=true');
			gr.update();
		}
	}
}());
