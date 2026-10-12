(function executeRule(current, previous /*null when async*/) {

	var config = new GlideRecord(ActivityConstants.TABLE_M2M_SUBOBJECT_ACTIVITY_TYPE);
	config.addQuery('subobject', current.subobject);
	config.addQuery('activity_type', current.activity_type);
	if(current.sys_id)
		config.addQuery('sys_id', '!=',current.sys_id );
	config.query();
	if(config.hasNext()) {
		gs.addInfoMessage(gs.getMessage('An entry already exists for this Subscribable Object and Activity Type.'));
		current.setAbortAction(true);
	}

})(current, previous);
