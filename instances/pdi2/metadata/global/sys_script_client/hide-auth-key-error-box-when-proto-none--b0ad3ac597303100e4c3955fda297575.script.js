function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading) {
      return;
   }
	
	g_form.hideFieldMsg('authentication_key', true);
	
	if (newValue != '' && g_form.getValue('authentication_key') != '' && g_form.getValue('authentication_key').length < 8)
		g_form.showErrorBox('authentication_key', getMessage('Key must be at least 8 characters in length'));
}
