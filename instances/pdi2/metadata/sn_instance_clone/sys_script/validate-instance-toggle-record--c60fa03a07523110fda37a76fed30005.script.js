(function executeRule(current, previous /*null when async*/) {

	var instanceToggleAllowedGr = new GlideRecord(CloneConstants.tableName.INSTANCE_TOGGLE_ALLOWED_TABLES);
	instanceToggleAllowedGr.addQuery('table', current.getValue('table'));
	instanceToggleAllowedGr.addQuery('condition', current.getValue('condition'));
	instanceToggleAllowedGr.addQuery('sys_id', '!=', current.getValue('sys_id'));
	instanceToggleAllowedGr.query();
	if(instanceToggleAllowedGr.next()) {
		gs.addErrorMessage(CloneConstants.errorMsg.INSTANCE_TOGGLE_ALLOWED_EXIST);
		current.setAbortAction(true);
	}

})(current, previous);
