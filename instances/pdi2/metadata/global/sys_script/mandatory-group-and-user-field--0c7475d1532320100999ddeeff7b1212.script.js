(function executeRule(current, previous /*null when async*/ ) {

	current.setAbortAction(true);

	if (JSUtil.nil(current.trigger_group_field) && JSUtil.nil(current.trigger_user_field))
		gs.addErrorMessage(gs.getMessage('Table: [{0}] is missing reference to Group [sys_user_group] and reference to User [sys_user]', current.table.getDisplayValue()));
	else if (JSUtil.nil(current.trigger_group_field))
		gs.addErrorMessage(gs.getMessage('Table: [{0}] is missing reference to Group [sys_user_group]', current.table.getDisplayValue()));
	else if (JSUtil.nil(current.trigger_user_field))
		gs.addErrorMessage(gs.getMessage('Table: [{0}] is missing reference to User [sys_user]', current.table.getDisplayValue()));

})(current, previous);
