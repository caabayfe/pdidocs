function onSubmit() {
	//return if the notification type is not engine
	if (g_form.getValue('generation_type') !== 'engine')
		return true;
	
	//clear any existing error message
	g_form.clearMessages();
	
	//show error message if both Update and Insert check box are not checked
	if (!g_form.getBooleanValue('action_insert') && !g_form.getBooleanValue('action_update')) {
		g_form.addErrorMessage(getMessage("This notification will not be generated as configured. Select a value for Insert or Update before submitting."));
		return false;
	}
}
