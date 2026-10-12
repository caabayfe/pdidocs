(function refineQuery(current, parent) {
	current.addQuery('app_config', parent.getUniqueValue());
	
	var rootMacroponents = [];
	
	var gr = new GlideRecord('sys_ux_page_registry');
	gr.addQuery('admin_panel_table', 'sys_ux_app_config');
	gr.query();
	while (gr.next()) {
		var rmp = gr.getValue('root_macroponent');
		if (!rootMacroponents.includes(rmp)) {
			rootMacroponents.push(rmp);
		}
	}
	var rmpString = rootMacroponents.join(',');
	
	var qc = current.addQuery('parent_macroponent', 'IN', rmpString);
	qc.addOrCondition('parent_macroponent', null);
})(current, parent);
