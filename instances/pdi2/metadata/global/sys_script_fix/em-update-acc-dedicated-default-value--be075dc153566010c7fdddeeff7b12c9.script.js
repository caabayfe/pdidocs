gs.log("**Updating acc_dedicated default value");
FixDictionary();
gs.log("Finish");

function FixDictionary() {
	if (pm.isZboot())
		return;

	var dictionary = new GlideRecord("sys_dictionary");
	if (!dictionary.isValid()) {
		gs.error("Invalid table: sys_dictionary");
		return;
	}

	dictionary.addQuery("name", "ecc_agent_ext_context_metric");
	dictionary.addQuery("element", "acc_dedicated_mid");

	dictionary.query();
	if (dictionary.next()) {
		dictionary.setValue("default_value", "true");
		if (!dictionary.update())
			gs.error("Could not update acc_dedicated_mid default value");
		gs.log("**updated "+dictionary.getValue('name')+" "+dictionary.getValue('element')+"  **");

	}
}
