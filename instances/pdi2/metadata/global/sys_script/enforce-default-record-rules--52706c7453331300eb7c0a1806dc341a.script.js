(function executeRule(current, previous /*null when async*/) {
	
	if (!gs.nil(current.email_accounts)) {
		gs.addErrorMessage(gs.getMessage('Default Email Account Group record should not have any email accounts'));
		current.setAbortAction(true);
	}
	
	if (!current.active) {
		gs.addErrorMessage(gs.getMessage('Default Email Account Group is always active to handle email accounts not assigned to a group.'));
		current.setAbortAction(true);
	}
	
	var emailAccountGroup = new GlideRecord(current.getTableName());
	emailAccountGroup.addQuery('sys_id', '!=', current.sys_id);
	emailAccountGroup.addQuery('default', true);
	emailAccountGroup.addActiveQuery();
	emailAccountGroup.query();
	if (emailAccountGroup.next()) {
		gs.addErrorMessage(gs.getMessage('There can only be one active default Email Account Group record'));
		current.setAbortAction(true);
	}

})(current, previous);
