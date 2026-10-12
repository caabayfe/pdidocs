function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		g_form.setReadOnly('workspace', false);
		return;
	}

	// Set workspace if definition has a workspace defined and set to read only
	// Remove readonly if action is switched to a workspace without a defined workspace 
	var definitionWorkspace = g_form.getReference('action').workspace;
	if (definitionWorkspace) {
		g_form.setValue('workspace', definitionWorkspace);
		g_form.setReadOnly('workspace', true);
	} else {
		g_form.setReadOnly('workspace', false);
	}
   
}
