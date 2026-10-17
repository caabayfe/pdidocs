function onSubmit() {
	if (g_form.getValue('life_cycle_control') == '') {
		var errorMsg = getMessage('Life cycle mapping cannot be activated until the "Life cycle control" field value is defined.');
		g_form.addErrorMessage(errorMsg);
		return false;
	}
    return true;
}
