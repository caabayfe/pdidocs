(function executeRule(current, previous /*null when async*/) {
	if (current.isNewRecord()) {
		return;	
	}
	var key_source = current.key_source.toString();
	if (key_source == "kmf") {
		return;
	}
	var signing_algorithm = current.signing_algorithm.toString();
	if (signing_algorithm.startsWith("rsa")) {
		var jwtAliasValidator = new SNC.JWTKeystoreAliasValidator();
		var keySize = jwtAliasValidator.getKeyStoreKeySize(current);
		if(keySize == -1) {
			gs.addInfoMessage(gs.getMessage("You cannot create/update this JWT key because it has an improper keystore type associated."));
		}
		else if(keySize < 2048) {
			gs.addInfoMessage(gs.getMessage("This JWT key has an RSA key size below 2048 bits. You should use an RSA key size greater than or equal to 2048 bits."));
		}
	}
})(current, previous);
