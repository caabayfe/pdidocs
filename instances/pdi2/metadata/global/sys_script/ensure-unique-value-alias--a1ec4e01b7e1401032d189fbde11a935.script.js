(function executeRule(current, previous /*null when async*/) {

	var record = new GlideRecord('sys_report_value_alias');
	if (! record.isValid()) {
		gs.addErrorMessage(gs.getMessage('There is something wrong woth the Value Alias table'));
		current.setAbortAction(true);
	}
	record.addQuery('sys_id', '!=', current.sys_id);
	record.addQuery('field_alias', current.field_alias);
	record.addQuery('value', current.value);
	record.addQuery('sys_domain', current.sys_domain);
	record.setWorkflow(false);
	record.setLimit(1);
	record.query();
	if (record.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Value Alias already exists'));
		current.setAbortAction(true);
	}

})(current, previous);
