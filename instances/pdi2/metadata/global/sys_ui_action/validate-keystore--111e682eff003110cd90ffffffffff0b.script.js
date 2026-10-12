try {
	current.update();
	analyze();
} catch(ex) {
	gs.addErrorMessage(gs.getMessage("Unable to analyze keystore."));
	gs.error("Unable to analyze keystore.");
	gs.error(ex.getMessage);

}
finally {
	action.setRedirectURL(current);
}

function analyze() {
	if (!current.keystore) {
		gs.addErrorMessage(gs.getMessage("Unable to analyze keystore. Keystore not selected."));
		return;
	}

	var res = new sn_auth.MTLSKeyStoreAnalyzer().analyze(current.keystore);
	if (!res) {
		gs.addErrorMessage(gs.getMessage("Unable to analyze keystore with null or empty result."));
		return;
	}

	res = JSON.parse(res);

	if (res.total_number_of_entries === 0) {
		gs.addErrorMessage(gs.getMessage("Keystore contains no entries."));
		return;
	}

	var errors = [];
	var infos = [];
	
	if (res.total_number_of_key_pairs < 1)
		errors.push(gs.getMessage("Keystore should contain at least one key pair. It has none."));

	if (res.total_number_of_key_pairs > 1)
		errors.push(gs.getMessage("Keystore should contain only one key pair. It has {0} key pairs", res.total_number_of_key_pairs));

	var keyPairs = res.key_pairs;

	if (keyPairs && keyPairs.key_pairs_with_invalid_key_pair_combination)
		errors.push(gs.getMessage("Keystore contains key pairs with invalid key pair combinations with aliases: {0}", keyPairs.key_pairs_with_invalid_key_pair_combination));

	if (keyPairs && keyPairs.key_pairs_with_self_issued_certificates)
		errors.push(gs.getMessage("Keystore contains key pairs with self issued certificates with aliases: {0}", keyPairs.key_pairs_with_self_issued_certificates));

	if (keyPairs && keyPairs.key_pairs_with_invalid_certificate_chains)
		errors.push(gs.getMessage("Keystore contains key pairs with invalid certificate chains with aliases: {0}", keyPairs.key_pairs_with_invalid_certificate_chains));		

	if (res.total_number_of_secret_keys > 0 || res.total_number_of_trust_store_certificates > 0)
		infos.push(gs.getMessage("Keystore may contain mix of secret keys and trust store certificates."));

    if (res.total_number_of_unrecoverable_entries > 0)
		errors.push(gs.getMessage("Keystore contains {0} unrecoverable entries with aliases: {1}", res.total_number_of_unrecoverable_entries, res.unrecoverable_entries));
	
	if (!errors && !infos)
		gs.addInfoMessage(gs.getMessage("Keystore successfully validated."));

	errors.forEach(gs.addErrorMessage);
	infos.forEach(gs.addInfoMessage);
}
