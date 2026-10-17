(function executeRule(){
	g_scratchpad.enforcePasswordMessage = gs.getMessage('To enforce password history policy, you must create an integer value parameter called {0}.','\'password_history_limit\'' );
	
	g_scratchpad.mandatoryHistoryParamMsg = gs.getMessage('You have to create the mandatory parameter {0}', '\'password_history_limit\'');
	g_scratchpad.unfilledMandatoryFieldsMsg = gs.getMessage('The following mandatory fields are not filled in: ');
	
	
	g_scratchpad.cur_enforce_history_policy = false;
	if (current.enforce_history_policy) {
		g_scratchpad.cur_enforce_history_policy = true;
		var paramGr = new GlideRecord('pwd_cred_store_param');
		paramGr.addQuery('cred_store', current.getUniqueValue());
		paramGr.addQuery('name', 'password_history_limit');
		paramGr.query();
		if (paramGr.next())
			g_scratchpad.cur_password_history_limit = parseInt(paramGr.getValue('value'));
	}
})();
