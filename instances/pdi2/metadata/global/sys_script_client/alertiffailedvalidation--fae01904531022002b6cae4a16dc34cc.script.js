function onLoad() {
    if (g_form.getValue('validated') == 'validation_failed')
		g_form.addErrorMessage(getMessage('MID Server validation failed, please try rekey'));
}
