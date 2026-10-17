(function executeRule(current, previous /*null when async*/) {

	var config = new GlideRecord(ActivityConstants.TABLE_ACTIVITY_CONTEXT);
	config.addQuery('context_table', current.context_table).addOrCondition('name', current.name);
	if(current.sys_id)
		config.addQuery('sys_id', '!=',current.sys_id );

	if(current.module)
		config.addQuery('module', current.module );
	else
		config.addNullQuery('module');

	config.query();
	if(config.next()) {
		if (config.name.toString() == current.name)
			gs.addInfoMessage(gs.getMessage('An entry already exists with this Name.'));
		else 
			gs.addInfoMessage(gs.getMessage('An entry already exists with this Context Table.'));

		current.setAbortAction(true);
	}

})(current, previous);
