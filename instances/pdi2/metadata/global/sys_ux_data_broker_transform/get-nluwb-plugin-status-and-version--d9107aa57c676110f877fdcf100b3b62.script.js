function transform() {
	var result = {};

	result.active = GlidePluginManager.isActive('sn_nlu_workbench');
	result.admin_console_version = false;

	var nluPlugin = new GlideRecord('sys_store_app');
	nluPlugin.addQuery('scope', 'sn_nlu_workbench');
	nluPlugin.query();

	// Check if NLUWB plugin version includes their admin console (anything past 7.0.1)
	if (nluPlugin.next()) {
		result.admin_console_version = Number(nluPlugin.getValue('version').replaceAll('.','')) >= 701 ? true : false;
	}

	return result;
}
