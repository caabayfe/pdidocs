function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	var isPublic = newValue == 'public';
	// Bail early because only the read operation is supported for a global table with caller restriction
	if (isPublic && g_form.getValue('sys_scope') == 'global' && g_form.getValue('caller_access') == '2') {
		g_form.setReadOnly('read_access', false);
		return;
	}
	
	_setCrudReadOnly(isPublic);
	_setConfigurationReadOnly(isPublic);
	
	if (!isPublic) {
		_setCrudFalse();
		_setConfigurationFalse();
	} else {
		g_form.setValue('read_access', true);
		g_form.setValue('ws_access', true);
	}
}

function _setCrudReadOnly(isPublic) {
	g_form.setReadOnly('read_access', !isPublic);	
	g_form.setReadOnly('create_access', !isPublic);
	g_form.setReadOnly('update_access', !isPublic);
	g_form.setReadOnly('delete_access', !isPublic);
	g_form.setReadOnly('ws_access', !isPublic);
}

function _setConfigurationReadOnly(isPublic) {
	g_form.setReadOnly('alter_access', !isPublic);
	g_form.setReadOnly('actions_access', !isPublic);
	g_form.setReadOnly('client_scripts_access', !isPublic);
	g_form.setReadOnly('configuration_access', !isPublic);
}

function _setCrudFalse() {
	g_form.setValue('read_access', false);
	g_form.setValue('create_access', false);
	g_form.setValue('update_access', false);
	g_form.setValue('delete_access', false);
	g_form.setValue('ws_access', false);
}

function _setConfigurationFalse() {
	g_form.setValue('alter_access', false);
	g_form.setValue('actions_access', false);
	g_form.setValue('client_scripts_access', false);
	g_form.setValue('configuration_access', false);
}
