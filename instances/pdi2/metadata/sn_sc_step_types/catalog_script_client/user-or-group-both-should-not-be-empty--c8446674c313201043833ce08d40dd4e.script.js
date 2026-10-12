function onSubmit() {
	var users = g_form.getValue("users");
	var groups = g_form.getValue("groups");
	
	//User or group, atleast one should not be empty
	if (!users && !groups) {
		var msg = getMessage("Add at least one user or group");
		g_form.addErrorMessage(msg);
		return false;
	}
}
