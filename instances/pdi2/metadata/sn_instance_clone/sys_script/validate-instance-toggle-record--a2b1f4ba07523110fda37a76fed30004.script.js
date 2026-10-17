(function executeRule(current, previous /*null when async*/) {

	var instanceToggleNotAllowedGr = new GlideRecord(CloneConstants.tableName.INSTANCE_TOGGLE_NOTALLOWED_TABLES);
	instanceToggleNotAllowedGr.addQuery('table', current.getValue('table'));
	instanceToggleNotAllowedGr.addQuery('sys_id', '!=', current.getValue('sys_id'));
	instanceToggleNotAllowedGr.query();
	if(instanceToggleNotAllowedGr.next()) {
		gs.addErrorMessage(CloneConstants.errorMsg.INSTANCE_TOGGLE_NOTALLOWED_EXIST);
		current.setAbortAction(true);
	}

})(current, previous);
