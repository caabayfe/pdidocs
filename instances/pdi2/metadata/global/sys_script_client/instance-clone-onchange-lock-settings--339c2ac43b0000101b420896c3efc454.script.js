function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') 
		return;
	
	if(newValue == 'true')
		g_form.showFieldMsg('lock_profile_settings', new GwtMessage().getMessage("After you submit, subsequent changes to clone profile will not apply to this clone request."), 'info');
	else
		g_form.hideFieldMsg('lock_profile_settings');
}
