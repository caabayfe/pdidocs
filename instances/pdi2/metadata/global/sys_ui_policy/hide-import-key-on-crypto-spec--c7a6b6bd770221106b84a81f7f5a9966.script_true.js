function onCondition() {

	var ATTEST_MODULE_ID = "75bdd8c2c70111109d59fa49f4c26031";
	var CODESIGNING_MODULE_ID = "a3123fddc32310101109046f5e40dd3e";

	if (g_form.getValue("crypto_module") != ATTEST_MODULE_ID && g_form.getValue("crypto_module") != CODESIGNING_MODULE_ID)
		return;

	if (g_user.hasRoleExactly("maint"))
		return;

	if (g_user.hasRoleExactly("security_admin") && g_user.hasRoleExactly("sn_kmf.cryptographic_manager"))
		return;

	// User doesn't have access to create a certificate for this module, we should hide the import key action
	// so that they don't accidentally upload a key and break the module.
	g_form.setDisplay("import_key_from_keystore", "false");
}
