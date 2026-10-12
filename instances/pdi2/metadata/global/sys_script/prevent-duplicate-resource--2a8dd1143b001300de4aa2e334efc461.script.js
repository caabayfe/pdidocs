(function executeRule(current, previous /*null when async*/) {
	var resource = current.rest_api_resource;
	var gr = new GlideRecord("sys_rate_limit_rules");
	gr.addQuery('rest_api_resource',resource);
	gr.addQuery('type','All');
	gr.query();
	if(gr.next()){
		if(gr.getUniqueValue() != current.sys_id){
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("REST API resource conflicts with existing resource of type - All users"));
		}
	}

})(current, previous);
