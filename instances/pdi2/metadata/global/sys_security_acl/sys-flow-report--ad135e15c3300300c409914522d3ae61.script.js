answer = false;
(function () {
	var flowContext;
	if (!gs.nil(current.context)) {
		flowContext = new GlideRecord('sys_flow_context');
		if (flowContext.get('sys_id', current.context))
			answer = flowContext.canRead();
		
	}
}());
