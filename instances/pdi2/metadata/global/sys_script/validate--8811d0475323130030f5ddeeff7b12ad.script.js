(function executeRule(current, previous /*null when async*/ ) {
	var key_source = current.key_source.toString();
	var signing_algorithm = current.signing_algorithm.toString();

	if (key_source == "kmf") {
		if (current.kmf_crypto_module.nil()) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("KMF crypto module must be configured for KMF signing keys"));
			return;
		}

		var SIGNATURE_GENERATION_PURPOSE = "299fb3a4c7003300af4d43c6f097633c";
		var specGR = new GlideRecord("sys_kmf_module_crypto_spec");
		specGR.addQuery("crypto_module", current.kmf_crypto_module);
		specGR.addQuery("crypto_purpose", SIGNATURE_GENERATION_PURPOSE);
		specGR.addActiveQuery();
		specGR.query();

		var kmfSigningAlgorithm = "";
		while (specGR.next()) {
			var algorithmName = specGR.algorithm.name.toString().toUpperCase();
			var bits = algorithmName.match(/\b(256|384|512)\b/);

			if (algorithmName.indexOf("RSA") == 0) {
				kmfSigningAlgorithm = "rsa_" + bits[1];
				break;
			}

			if (algorithmName.indexOf("EC") == 0) {
				kmfSigningAlgorithm = "es_" + bits[1];
				break;
			}
		}

		if (!kmfSigningAlgorithm) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("The selected KMF crypto module does not have an active asymmetric signing specification."));
			return;
		}

		current.signing_algorithm = kmfSigningAlgorithm;
		return;
	}

	if (signing_algorithm.startsWith("es")) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Only KMF key source is supported for Elliptic Curve signing algorithms."));
		return;
	}

    if (signing_algorithm.startsWith("rsa")) {
        var jwtAliaValidator = new SNC.JWTKeystoreAliasValidator();
        try {
            // The referred Signing keystore should be Active as well as of 'Java Key Store' or 'BC FIPS Keystore' type.
			if (!current.signing_keystore.active || !(current.signing_keystore.type == 'key_store' || current.signing_keystore.type == 'bcfks_key_store')) {
                throw "Invalid Signing Keystore. Please select an Active JKS(Java Key Store) or BCFKS(BC FIPS Keystore).";
            }

            jwtAliaValidator.validate(current);
            var gr = new GlideRecord("jwt_keystore_aliases");
            gr.initialize();
            gr.addQuery("certificate_thumbprint", current.certificate_thumbprint);
            gr.addQuery("sys_scope", current.sys_scope);
            gr.query();
            if (gr.next()) {
                if (!current.getUniqueValue().equals(gr.getUniqueValue())) {
                    throw ("Please use JWT Key record that already exists : " + gr.getValue("name"));
                }
            }
        } catch (e) {
            current.setAbortAction(true);
            // Handling both Java and Javascript Exception Messages.
            // For Java Exceptions, there will be an Exception object, hence using e.getMessage()
            // For Javascript Exceptions, there will be only string message. 
            gs.addErrorMessage(gs.getMessage(e.getMessage() === undefined ? e : e.getMessage()));
        }
    }
	// Validate secret key length in case of HMAC signing
	if (signing_algorithm.startsWith("hmac")) {
		var JavaString = Packages.java.lang.String;
		var shared_secret = current.signing_key_password.getDecryptedValue();
		var shared_secret_bits_length = new JavaString(shared_secret).getBytes("UTF-8").length * 16;
		if (signing_algorithm.equals("hmac_256") && shared_secret_bits_length < 256) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("The signing key length must be at least 256 bits."));
		} else if(signing_algorithm.equals("hmac_384") && shared_secret_bits_length < 384) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("The signing key length must be at least 384 bits..")); 
		} else if(signing_algorithm.equals("hmac_512") && shared_secret_bits_length < 512) {
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage("The signing key length must be at least 512 bits.")); 
		}
   }
})(current, previous);
