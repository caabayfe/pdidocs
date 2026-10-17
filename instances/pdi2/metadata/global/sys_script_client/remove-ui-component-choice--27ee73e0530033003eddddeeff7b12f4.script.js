function onLoad() {
	if (g_user.hasRole('maint') || (!g_form.isNewRecord() && g_form.getValue('action_type') == 'action_component'))
		return;
	
	
	g_form.removeOption('action_type', 'action_component');
}
