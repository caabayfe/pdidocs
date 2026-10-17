(function executeRule(current, previous /*null when async*/) {

	var config = new GlideRecord(ActivityConstants.TABLE_SOURCE_CONTEXT_MAPPING);
	config.addQuery('activity_context', current.activity_context);
	config.addQuery('activity_type', current.activity_type);
	
	if(current.module)
		config.addQuery('module', current.module );
	else 
		config.addNullQuery('module');
	
	if(current.sys_id)
		config.addQuery('sys_id', '!=',current.sys_id );
	config.query();
	if(config.hasNext()) {
		gs.addInfoMessage(gs.getMessage('An entry already exists for this Activity Context and Activity Type.'));
		current.setAbortAction(true);
	}

})(current, previous);
