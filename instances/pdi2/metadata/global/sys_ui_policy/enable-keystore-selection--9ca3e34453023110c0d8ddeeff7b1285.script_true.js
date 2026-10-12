function onCondition() {
	var isKeystoreSelectionEnabled = g_scratchpad.glideEmailAccountEnableKeystoreSelection ? true : false;
	g_form.setDisplay("keystore", isKeystoreSelectionEnabled);

}
