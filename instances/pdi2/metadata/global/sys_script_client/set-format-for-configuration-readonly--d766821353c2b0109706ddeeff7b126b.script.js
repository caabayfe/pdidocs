function onLoad() {
	if (!g_form.isNewRecord() && g_form.getValue('format_for_configurable_workspace') === 'true'){  
		g_form.setReadOnly('format_for_configurable_workspace', 'true');
	} else if (g_form.isNewRecord()) {
		var isWorkspaceAction = g_form.getValue('form_button_v2') === 'true' || g_form.getValue('form_menu_button_v2') === 'true';
		if (isWorkspaceAction) {
			g_form.setValue('format_for_configurable_workspace', 'true');
		} else {
			g_form.setReadOnly('format_for_configurable_workspace', 'true');
		}
	}
}
