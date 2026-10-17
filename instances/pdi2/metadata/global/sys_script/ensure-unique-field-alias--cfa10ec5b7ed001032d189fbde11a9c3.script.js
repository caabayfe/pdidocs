(function executeRule(current, previous /*null when async*/) {

	var record = new GlideRecord('sys_report_field_alias');
	if (! record.isValid()) {
		gs.addErrorMessage(gs.getMessage('There is something wrong woth the Field Alias table'));
		current.setAbortAction(true);
	}
	record.addQuery('sys_id', '!=', current.sys_id);
	record.addQuery('report', current.report);
	record.addQuery('table', current.table);
	record.addQuery('field', current.field);
	record.addQuery('sys_domain', current.sys_domain);
	record.setWorkflow(false);
	record.setLimit(1);
	record.query();
	if (record.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Field Alias already exists'));
		current.setAbortAction(true);
	}

})(current, previous);
