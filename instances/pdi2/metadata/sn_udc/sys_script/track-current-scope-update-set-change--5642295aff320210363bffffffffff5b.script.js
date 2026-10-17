(function executeRule(current, previous /*null when async*/) {
	function getUpdateSetScope(updateSetSysId) {
		var gr = new GlideRecord('sys_update_set');
		if (!gr.get(updateSetSysId)) return null;

		return gr.getValue('application');
	}

	function getScopeName(scopeId) {
		var gr = new GlideRecord('sys_scope');
		if (!gr.get(scopeId)) return null;

		return gr.getValue('scope');
	}

	if (gs.nil(current)) return;

	const preferenceName = current.getValue('name');
	const preferenceValue = current.getValue('value');
	const watchType = {
		UPDATE_SET: 'update_set',
		SESSION_SCOPE: 'session_scope',
	};

	const watchGr = new GlideRecord('sn_udc_developer_session_watch');
	watchGr.addQuery('user', gs.getUserID());
	watchGr.addQuery(
		'watch_type',
		preferenceName === 'sys_update_set' ? watchType.UPDATE_SET : watchType.SESSION_SCOPE
	);
	watchGr.query();

	const recordExists = watchGr.next();
	if (!recordExists) watchGr.newRecord();

	// set the fields
	watchGr.setValue('user', gs.getUserID());

	if (preferenceName === 'sys_update_set') {
		watchGr.setValue('watch_type', watchType.UPDATE_SET);
		watchGr.setValue('current_update_set', preferenceValue);
		watchGr.setValue('update_set_scope', getUpdateSetScope(preferenceValue));
	} else {
		watchGr.setValue('watch_type', watchType.SESSION_SCOPE);
		watchGr.setValue('session_scope', preferenceValue);
		watchGr.setValue('session_scope_name', getScopeName(preferenceValue));
	}

	// upsert
	recordExists ? watchGr.update() : watchGr.insert();
})(current, previous);
