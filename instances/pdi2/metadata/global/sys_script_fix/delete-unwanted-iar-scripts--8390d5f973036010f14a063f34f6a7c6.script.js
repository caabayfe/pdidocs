executeIARFixScript();

function executeIARFixScript() {
	/*
	Delete Client scripts
	- Reload page on ML training state change
	- Validate solution definition name
	 */
	var clientScriptGr = new GlideRecord('sys_script_client');
	clientScriptGr.addQuery('table', AutoResolutionConstants.CONFIG_TABLE_NAME);
	clientScriptGr.addQuery('sys_id', 'IN', '13de91d273f61010f14a063f34f6a78d,7a851fb973f39010f14a063f34f6a767');
	clientScriptGr.query();

	if (clientScriptGr.getRowCount() != 2)
		gs.warn('Client scripts that needs to be deprecated are not found');
	
	while (clientScriptGr.next()) {
		gs.info('Deleting client script: ' + clientScriptGr.getValue('name'));
		clientScriptGr.deleteRecord();
	}

	/*
	Delete UI Actions
	- Retrain
	*/
	var uiActionSysIDs = [];
	var uiActionGr = new GlideRecord('sys_ui_action');
	uiActionGr.addQuery('table', AutoResolutionConstants.CONFIG_TABLE_NAME);
	uiActionGr.addQuery('sys_id', 'IN', '62f7c1fa73b61010f14a063f34f6a7fa,61108d4973162010f14a063f34f6a72e');
	uiActionGr.query();
	
	if (uiActionGr.getRowCount() != 2)
		gs.warn('UI actions that needs to be deprecated are not found');
	
	while (uiActionGr.next()) {
		gs.info('Deleting UI action: ' + uiActionGr.getValue('name'));
		uiActionGr.deleteRecord();
	}

	/*
	Delete UI Policy
	- Log message when training fails
	*/
	var uiPolicyGr = new GlideRecord('sys_ui_policy');
	uiPolicyGr.addQuery('table', AutoResolutionConstants.CONFIG_TABLE_NAME);
	uiPolicyGr.addQuery('sys_id', '9d0c62cb73c71010f14a063f34f6a72b');
	uiPolicyGr.query();
	if (uiPolicyGr.next()) {
		gs.info('Deleting UI policy: ' + uiPolicyGr.getValue('short_description'));
		uiPolicyGr.deleteRecord();
	} else {
		gs.warn('Unable to find UI Policy {0} on Issue Auto-Resolution configuration table. ', 'Log message when training fails');
	}
}
