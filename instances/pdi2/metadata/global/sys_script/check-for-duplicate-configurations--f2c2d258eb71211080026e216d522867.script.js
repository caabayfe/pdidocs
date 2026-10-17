(function executeRule(current, previous /*null when async*/) {

	var config = new GlideRecord('sysevent_alert_configuration');
	config.addQuery('category', current.category);
	config.addQuery('subcategory', current.subcategory);
	config.addQuery('table', current.table);
	config.addQuery('condition', current.condition);
	config.addQuery('sys_id', '!=', current.sys_id);
	config.addActiveQuery();
	config.addLimit(1);
	config.query();

	if (!config.next())
		return;


	var recordURL = 'sysevent_alert_configuration.do?sys_id=' + config.sys_id;
    gs.addErrorMessage(gs.getMessage("There is a duplicate configuration that already exists. <a target='_blank' href='{0}'>Click here</a> to review", [recordURL]));
	current.setAbortAction(true);

})(current, previous);
