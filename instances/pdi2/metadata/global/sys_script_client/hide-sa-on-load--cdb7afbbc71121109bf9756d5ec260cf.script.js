function onLoad() {

	if (g_form.getValue('local_or_existing') == 'Local') {
		g_form._setDisplay('security_attribute', false);
		g_form._setDisplay('security_attribute.condition', true);
	}
}
