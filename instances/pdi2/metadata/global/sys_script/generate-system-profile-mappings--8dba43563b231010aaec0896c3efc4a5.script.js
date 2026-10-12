(function executeRule(current, previous /*null when async*/) {

	var cloneProfilePreserverGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_PRESERVER);
	
	if(current.operation() == 'insert' && current.getValue('default') == 0)
		return;
	
	if(current.operation() == 'update' && current.getValue('default') == 0) {
		cloneProfilePreserverGr.addQuery('profile', CloneConstants.SYSTEM_PROFILE_SYS_ID);
		cloneProfilePreserverGr.addQuery('preserver', current.getValue('sys_id'));
		cloneProfilePreserverGr.deleteMultiple();
		return;
	}
	
	cloneProfilePreserverGr.initialize();
	cloneProfilePreserverGr.setValue('profile', CloneConstants.SYSTEM_PROFILE_SYS_ID);
	cloneProfilePreserverGr.setValue('preserver', current.getValue('sys_id'));
	cloneProfilePreserverGr.insert();
	
})(current, previous);
