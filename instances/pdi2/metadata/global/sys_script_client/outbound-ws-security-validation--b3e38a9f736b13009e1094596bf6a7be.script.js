function onSubmit() {
	
	if (g_form.getValue('type') == 'outbound' && g_form.getValue('ws_security_x_509_profile') == '' && g_form.getValue('ws_security_username_profile') == '')
		{
		g_form.clearMessages();
		g_form.addErrorMessage(getMessage('No Profile Selected'));
		return false;
	}
	
}
