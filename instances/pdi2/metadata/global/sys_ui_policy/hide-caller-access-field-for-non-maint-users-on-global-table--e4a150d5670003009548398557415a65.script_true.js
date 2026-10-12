function onCondition() {
	// If user is maint, just remove caller tracking option, since it's not supported for global resources, and bail early
	if (g_user.hasRole('maint')) {
		g_form.removeOption('caller_access', '1');
		return;
	}
	
	// If user isn't maint and caller access is none, hide the field
	if (g_form.getValue('caller_access') == '')
		g_form.setDisplay('caller_access', false);
}
