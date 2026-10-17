function onSubmit() {
	if (g_form.hasFieldMsgs("error")) {
		g_form.addErrorMessage(getMessage("Please enter valid inputs"));
		return false;
	}
	return true;
}
