function onLoad() {
	// if the old use_basic_auth flag is set, then make sure basic_simple is selected in auth type choice
	// list unless auth_type already has a value
	if (g_form.getBooleanValue('use_basic_auth')){
		if (g_form.getValue('authentication_type') === '') {
			g_form.setValue('authentication_type', 'basic_simple');
		}
	}
	else {
		// otherwise, use_basic_auth is false. If auth type doesn't have basic_simple as the current value
		// then remove basic_simple from the choice list
		if (g_form.getValue('authentication_type') != 'basic_simple')
			g_form.removeOption('authentication_type', 'basic_simple');
	}
	
}
