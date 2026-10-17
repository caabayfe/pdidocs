	var id = current.sys_id;
	var gr = new GlideRecord('sys_flow_context');
	gr.addQuery('source_table', 'business_app_request');
	gr.addQuery('source_record', id);
	gr.query();
	if(gr.next()) {
		var contextId = gr.getUniqueValue(); 
        action.setRedirectURL('/sys_flow_context.do?sys_id='+contextId);
	}
	else {
		action.setRedirectURL('/sys_flow_context_list.do');
	}
	
