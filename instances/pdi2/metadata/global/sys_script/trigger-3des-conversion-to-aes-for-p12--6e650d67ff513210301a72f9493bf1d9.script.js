(function executeRule(current, previous /*null when async*/ ) {
    var active = current.getValue("active");
    var type = current.getValue("type");

    // Skip if not active or not a PKCS12 keystore
    if (active == 0 || type != 'pkcs12_key_store')
        return;

    try {
        var kmfInterface = new SNC.KMFAutomationInterface();
        // If the instance is in fips approved only mode and user is trying to insert sys_certificate of type p12 using BG script, abort the action.
        // Note: UI selection of P12 type will be aborted by UI action client script.
        if (kmfInterface.isInFipsApprovedOnlyMode()) {
            gs.addErrorMessage(gs.getMessage("Cannot create a P12 type keystore in FIPS approved only mode"));
            current.setAbortAction(true);
            return;
        }

        gs.info(gs.getMessage("[P12 3DES validate and conversion] Initiating 3DES scan for record: {0}", current.sys_id));
        var result = JSON.parse(kmfInterface.validateAndConvert3DESCertificate(current.getUniqueValue()));

        if (!result)
            throw new Error("Failed to validate P12 certificate");

        if (result.processed) {
            gs.addInfoMessage(gs.getMessage("Success: {0}", result.message));
            return;
        }

        if (!result.success)
            gs.addErrorMessage(gs.getMessage("Error: {0}", result.error));
    } catch (e) {
        var errorMsg = (e.message || e);
        gs.error(gs.getMessage("[P12 3DES conversion] Failed to trigger the conversion for certificate: {0}. Error: {1}", [current.sys_id, errorMsg]));
        gs.addErrorMessage(gs.getMessage("Failed to trigger 3DES conversion result: {0}", errorMsg));
    }
})(current, previous);
