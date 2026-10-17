function onLoad() {
	var isMaint = g_user.hasRole('maint');
	_setConfigurationDisplay(isMaint);
	
	if (g_form.isNewRecord()) {	
		_setDefaultCrud();
		_setDefaultConfiguration();
	}
	
	var canRead = g_form.getBooleanValue("read_access");
	var canCreate = g_form.getBooleanValue("create_access");
	var canUpdate = g_form.getBooleanValue("update_access");
	var canDelete = g_form.getBooleanValue("delete_access");
	var webServices = g_form.getBooleanValue("ws_access");
	var isPublic = canRead || canCreate || canUpdate || canDelete || webServices;	
	var accessIndex = isPublic ? 0 : 1;
	var accessElem = gel("sys_db_object.access");
	if(accessElem)
		accessElem.selectedIndex = accessIndex;
	_setCrudReadOnly(isPublic);
	_setConfigurationReadOnly(isPublic);
}

function _setCrudReadOnly(isPublic) {
	g_form.setReadOnly('read_access', !isPublic);
	g_form.setReadOnly('create_access', !isPublic);
	g_form.setReadOnly('update_access', !isPublic);
	g_form.setReadOnly('delete_access', !isPublic);
	g_form.setReadOnly('ws_access', !isPublic);
}

function _setConfigurationDisplay(isMaint) {
	g_form.setDisplay('alter_access', isMaint);
	g_form.setDisplay('actions_access', isMaint);
	g_form.setDisplay('client_scripts_access', isMaint);
	g_form.setDisplay('configuration_access', !isMaint);
}

function _setConfigurationReadOnly(isPublic) {
	g_form.setReadOnly('alter_access', !isPublic);
	g_form.setReadOnly('actions_access', !isPublic);
	g_form.setReadOnly('client_scripts_access', !isPublic);
	g_form.setReadOnly('configuration_access', !isPublic);
}

function _setDefaultCrud() {	
	g_form.setValue('create_access', false);
	g_form.setValue('update_access', false);
	g_form.setValue('delete_access', false);
	g_form.setValue('read_access', true);
	g_form.setValue('ws_access', true);
}

function _setDefaultConfiguration() {
	g_form.setValue('alter_access', false);
	g_form.setValue('actions_access', false);
	g_form.setValue('client_scripts_access', false);
	g_form.setValue('configuration_access', false);
}
