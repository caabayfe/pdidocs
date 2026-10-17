// Reference Qualifier, advanced.
var grCryptoSpec = new GlideRecord('sys_dictionary');
grCryptoSpec.addQuery('element', 'crypto_spec');
grCryptoSpec.addQuery('name', 'sys_kmf_crypto_caller_policy');
grCryptoSpec.query();

if (grCryptoSpec.next()) {
	if (grCryptoSpec.getValue('use_reference_qualifier') == "simple") {
		grCryptoSpec.setValue("choice", 0);
		grCryptoSpec.setValue("use_reference_qualifier", "advanced");
		grCryptoSpec.setValue("reference_qual", "javascript: 'crypto_module=' + current.crypto_module;");
		grCryptoSpec.update();
	}
}

// Set crypto_module - display to false; alias which was added in San Diego has display set to true, already. 
var grCryptoMod = new GlideRecord('sys_dictionary');
grCryptoMod.addQuery('element', 'crypto_module');
grCryptoMod.addQuery('name', 'sys_kmf_module_crypto_spec');
grCryptoMod.query();
if (grCryptoMod.next()) {
	if (grCryptoMod.getValue('display') == true){
		grCryptoMod.setValue("display", false);
		grCryptoMod.update();
	}
}
