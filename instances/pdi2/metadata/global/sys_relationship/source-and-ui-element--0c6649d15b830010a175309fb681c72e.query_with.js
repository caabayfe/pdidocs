(function refineQuery(current, parent) {
    
		var screenUiElements = [];
		var gr = new GlideRecord("sys_sg_screen_m2m_ui_element");
		gr.addQuery('screen',parent.getUniqueValue());
		gr.query();
		while(gr.next())
			screenUiElements.push(gr.getValue('ui_element'));
		var screenParams = [];
		var grUiParams = new GlideRecord("sys_sg_ui_parameter");								 
		grUiParams.addQuery('screen',parent.getUniqueValue());
		grUiParams.query();
		while(grUiParams.next())
			screenParams.push(grUiParams.getUniqueValue());
		current.addQuery('ui_element','IN', screenUiElements.join());
		current.addQuery('source_table','sys_sg_ui_parameter');
		current.addQuery('source','IN', screenParams.join());
		
})(current, parent);
