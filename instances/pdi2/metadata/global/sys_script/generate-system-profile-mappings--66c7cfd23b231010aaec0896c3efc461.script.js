(function executeRule(current, previous /*null when async*/) {

	var cloneProfileExclusionGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_EXCLUSION);
	
	if(current.operation() == 'insert' && current.getValue('default') == 0)
		return;
	
	if(current.operation() == 'update' && current.getValue('default') == 0) {
		cloneProfileExclusionGr.addQuery('profile', CloneConstants.SYSTEM_PROFILE_SYS_ID);
		cloneProfileExclusionGr.addQuery('exclusion', current.getValue('sys_id'));
		cloneProfileExclusionGr.deleteMultiple();
		return;
	}
	
	cloneProfileExclusionGr.initialize();
	cloneProfileExclusionGr.setValue('profile', CloneConstants.SYSTEM_PROFILE_SYS_ID);
	cloneProfileExclusionGr.setValue('exclusion', current.getValue('sys_id'));
	cloneProfileExclusionGr.insert();
	
})(current, previous);
