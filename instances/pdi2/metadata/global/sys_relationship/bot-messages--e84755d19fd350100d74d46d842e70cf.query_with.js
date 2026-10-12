(function refineQuery(current, parent) {

	current.addQuery('message_type','bot message');
	current.addQuery('sys_cs_provider_application', parent.sys_id);
		
})(current, parent);
