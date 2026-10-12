function onSubmit() {
    if (g_form.getValue('regex') == '') {
        g_form.addErrorMessage(getMessage('Regex for the custom matcher cannot be empty. Please use the Generate Regex UI Action to generate the regex'));
		return false;
	}

}
