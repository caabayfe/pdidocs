(function executeRule(current, previous /*null when async*/) {

    var ipkiCertMapManager = new IPKICertMapManager();

    // 1. A new entry can only be created in Processing state.
    if (current.getValue('state') != ipkiCertMapManager.STATE.PROCESSING) {
        gs.addErrorMessage(gs.getMessage('A new certificate mapping can only be created in Processing state.'));
        current.setAbortAction(true);
        return;
    }

    // 2. User must be specified.
    var userSysId = current.getValue('user');
    if (!userSysId) {
        gs.addErrorMessage(gs.getMessage('User must be specified when creating a certificate mapping.'));
        current.setAbortAction(true);
        return;
    }

    // 3. At least agent or certificate (or both) must be specified.
    var hasAgent = !current.agent.nil();
    var hasKmfCert = !current.kmf_certificate.nil();
    
    if (!hasAgent && !hasKmfCert) {
        gs.addErrorMessage(gs.getMessage('At least agent or certificate must be specified when creating a certificate mapping.'));
        current.setAbortAction(true);
        return;
    }

    // 4. The KMF certificate must be created by the MID_SERVICE_IPKI_ENDPOINT and must not be revoked.
    var kmfCertSysId = current.getValue('kmf_certificate');
    if (kmfCertSysId) {
        try {
            var kmfCertUtil = new KMFCertificateUtility();
            var kmfCertGr = kmfCertUtil.getBySysId(kmfCertSysId);

            if (!kmfCertGr)
                throw new ResourceNotFoundError('The KMF certificate does not exist.');
            
            // Check if certificate is an IPKI MID Services certificate
            if (!kmfCertUtil.isIpkiMidCertificate(kmfCertGr)) {
                gs.addErrorMessage(gs.getMessage('The KMF certificate must be an IPKI MID Services certificate.'));
                current.setAbortAction(true);
                return;
            }
            
            if (kmfCertUtil.isRevoked(kmfCertGr)) {
                gs.addErrorMessage(gs.getMessage('A revoked KMF certificate cannot be used.'));
                current.setAbortAction(true);
                return;
            }
        } catch (e) {
            if (e instanceof ResourceNotFoundError) {
                gs.addErrorMessage(gs.getMessage('The KMF certificate does not exist.'));
            } else {
                gs.error('Failed to validate KMF certificate: ' + kmfCertSysId + '. Error: ' + e.message);
            }
            current.setAbortAction(true);
            return;
        }
    }

    // 6. Validate the user has the mid_server role.
    var userUtil = new UserUtility();
    var userGr = userUtil.getById(userSysId);
    
    if (!userGr) {
        gs.addErrorMessage(gs.getMessage('The user does not exist.'));
        current.setAbortAction(true);
        return;
    }
    
    if (!userUtil.hasRoles(userGr, ['mid_server'])) {
        gs.addErrorMessage(gs.getMessage('The user must have the mid_server role.'));
        current.setAbortAction(true);
        return;
    }

})(current, previous);
