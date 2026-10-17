(function executeRule(current, previous /*null when async*/) {

	// Cascade active and/or order changes to ALL clone profile records
	if (current.active.changes() || current.order.changes()) {
		var syncGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT);
		syncGr.addQuery('cleanup_script', current.getValue('sys_id'));
		syncGr.query();
		while (syncGr.next()) {
			if (current.active.changes())
				syncGr.setValue('active', current.getValue('active'));
			if (current.order.changes())
				syncGr.setValue('order', current.getValue('order'));
			syncGr.update();
		}
	}

	// Handle default field change - manage System Profile membership
	if (!current['default'].changes())
		return;

	var cloneProfileCleanupScriptGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT);

	if(current.operation() == 'insert' && current.getValue('default') == 0)
		return;

	if(current.operation() == 'update' && current.getValue('default') == 0) {
		cloneProfileCleanupScriptGr.addQuery('profile', CloneConstants.SYSTEM_PROFILE_SYS_ID);
		cloneProfileCleanupScriptGr.addQuery('cleanup_script', current.getValue('sys_id'));
		cloneProfileCleanupScriptGr.deleteMultiple();
		return;
	}

	cloneProfileCleanupScriptGr.initialize();
	cloneProfileCleanupScriptGr.setValue('profile', CloneConstants.SYSTEM_PROFILE_SYS_ID);
	cloneProfileCleanupScriptGr.setValue('cleanup_script', current.getValue('sys_id'));
	cloneProfileCleanupScriptGr.insert();

})(current, previous);
