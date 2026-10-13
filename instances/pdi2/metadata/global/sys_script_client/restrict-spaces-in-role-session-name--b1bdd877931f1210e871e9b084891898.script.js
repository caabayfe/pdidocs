function onSubmit() {
    var roleSessionName = g_form.getValue('role_session_name');

    // Check if there is a space in the value
    if (roleSessionName.indexOf(' ') !== -1) {
		// Hide existing error message to prevent duplication
		g_form.hideErrorBox('role_session_name');
        g_form.showErrorBox('role_session_name', getMessage("This field cannot contain spaces."));
		return false;
    }

    return true;
}
