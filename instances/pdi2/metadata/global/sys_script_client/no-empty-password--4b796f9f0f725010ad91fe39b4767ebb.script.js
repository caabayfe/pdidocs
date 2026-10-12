function onSubmit() {
	var password = g_form.getValue('password');
	var isExternalCredentialStoreSelected = g_form.getBooleanValue('use_high_security');

	if (trim(password) == '' && !isExternalCredentialStoreSelected) {
		g_form.addInfoMessage(formatMessage(getMessage('Password Required')));
		return false;
	}
}
