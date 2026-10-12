(function refineQuery(current, parent) {

	var gr = new GlideRecord('sys_app_template_input_var');
	gr.addQuery('template', parent.getUniqueValue());
	gr.addQuery('name', 'scan_id');
	gr.query();
	
	if (gr.next()) {
		var scanInstanceId = gr.getValue('default');
		current.addQuery('scan_instance', scanInstanceId);
	} else {
		current.addQuery('sys_id', 'doesnotexist');
	}

})(current, parent);
