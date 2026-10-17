function onAfter(current, previous) {
	var ops = new GlideRecord('sys_ws_operation');
	ops.addQuery('web_service_definition', current.sys_id);
	ops.query();
	
	// copy the produces/consumes settings from the parent service to the operations
	while (ops.next()) {
		var doUpdate = false;
		
		if (!ops.produces_customized) {
			ops.produces = ops.web_service_definition.produces;
			doUpdate = true;
		}
		
		if (!ops.consumes_customized) {
			ops.consumes = ops.web_service_definition.consumes;
			doUpdate = true;
		}
		
		if (doUpdate) {
			ops.propagating_from_parent = true;
			ops.update();
		}
	}
}
