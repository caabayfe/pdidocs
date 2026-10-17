(function executeRule(current, previous /*null when async*/) {
	var abort = false;
    try {
		var fingerPrint = SNC.GlideWebAuthnMetadata.calculateFingerPrint(current.pem_certificate);

		if(gs.nil(fingerPrint)) {
			abort = true;
		} else 
			current.sha256_fingerprint = fingerPrint;
    } catch (e) {
        gs.error("Error Occurred : " + e);
        abort = true;
    }

    if (abort) {
        current.setAbortAction(abort);
    }

})(current, previous);
