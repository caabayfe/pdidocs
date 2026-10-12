(function executeRule(current, previous /*null when async*/) {

	var config = new GlideRecord(ActivityConstants.TABLE_M2M_CONTEXT_SUBOBJECT);
	config.addQuery('activity_context', current.activity_context);
	config.addQuery('subobject', current.subobject);
	if(current.sys_id)
		config.addQuery('sys_id', '!=',current.sys_id );
	config.query();
	if(config.hasNext()) {
		gs.addInfoMessage(gs.getMessage('An entry already exists for this Activity Context and Activity Group.'));
		current.setAbortAction(true);
	}

})(current, previous);
