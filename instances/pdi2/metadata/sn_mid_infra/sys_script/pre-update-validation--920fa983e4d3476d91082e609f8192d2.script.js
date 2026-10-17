(function executeRule(current, previous /*null when async*/) {

    var ipkiCertMapManager = new IPKICertMapManager();

    // 1. An Inactive record state cannot be changed.
    if (previous.getValue('state') == ipkiCertMapManager.STATE.INACTIVE && current.state.changes()) {
        gs.addErrorMessage(gs.getMessage('The state of this certificate mapping cannot be changed from Inactive.'));
        current.setAbortAction(true);
        return;
    }

    // 2. An Active record cannot be made Processing.
    if (previous.getValue('state') == ipkiCertMapManager.STATE.ACTIVE && current.getValue('state') == ipkiCertMapManager.STATE.PROCESSING) {
        gs.addErrorMessage(gs.getMessage('An Active certificate mapping cannot be changed to Processing.'));
        current.setAbortAction(true);
        return;
    }

    // 3. State cannot be Active if required fields are not all populated.
    if (current.getValue('state') == ipkiCertMapManager.STATE.ACTIVE) {
        var hasUser = current.getValue('user') ? true : false;
        var hasAgent = !current.agent.nil();
        var hasKmfCert = !current.kmf_certificate.nil();

        if (!hasUser || !hasAgent || !hasKmfCert) {
            gs.addErrorMessage(gs.getMessage('State cannot be Active unless user, agent, and KMF certificate are all specified.'));
            current.setAbortAction(true);
            return;
        }
        
        // 3a. Ensure no other active record exists for the same agent.
        if (current.state.changes() && current.getValue('state') == ipkiCertMapManager.STATE.ACTIVE) {
            var agentSysId = current.getValue('agent');
            if (agentSysId) {
                var existingActiveRecord = ipkiCertMapManager.getActiveRecordByAgent(agentSysId);
                if (existingActiveRecord && existingActiveRecord.getUniqueValue() !== current.getUniqueValue()) {
                    gs.addErrorMessage(gs.getMessage('Cannot make this record Active. Another active record already exists for this agent: {0}', existingActiveRecord.getUniqueValue()));
                    current.setAbortAction(true);
                    return;
                }
            }
        }
    }

    // 4. At least agent or certificate (or both) must be specified.
    var hasAgent = !current.agent.nil();
    var hasKmfCert = !current.kmf_certificate.nil();
    
    if (!hasAgent && !hasKmfCert) {
        gs.addErrorMessage(gs.getMessage('At least agent or certificate must be specified in the certificate mapping.'));
        current.setAbortAction(true);
        return;
    }

    if (current.kmf_certificate.changes()) {
        var previousKmfCert = previous.getValue('kmf_certificate');
   
        // 6. kmf_certificate cannot be modified if already set.
        if (previousKmfCert) {
            gs.addErrorMessage(gs.getMessage('The KMF certificate cannot be modified once set.'));
            current.setAbortAction(true);
            return;
        }

        // 7. kmf_certifcate must be created by our endpoint only.
        var kmfCertUtil = new KMFCertificateUtility();
        var kmfCertGr = kmfCertUtil.getBySysId(current.getValue('kmf_certificate'));
        if (!kmfCertGr) {
            gs.addErrorMessage(gs.getMessage('The KMF certificate: {0} is not found.', current.getValue('kmf_certificate')));
            current.setAbortAction(true);
            return;
        }
        
        // Check if certificate is an IPKI MID Services certificate
        if (!kmfCertUtil.isIpkiMidCertificate(kmfCertGr)) {
            gs.addErrorMessage(gs.getMessage('The KMF certificate must be an IPKI MID Services certificate.'));
            current.setAbortAction(true);
            return;
        }

        // 8. kmf_certifcate must not be revoked.
        if (kmfCertUtil.isRevoked(kmfCertGr)) {
            gs.addErrorMessage(gs.getMessage('A revoked KMF certificate cannot be used.'));
            current.setAbortAction(true);
            return;
        }
    }
    
    // 9. agent cannot be modified if already set.
    if (current.agent.changes() && previous.getValue('agent')) {
        gs.addErrorMessage(gs.getMessage('The agent cannot be modified once set.'));
        current.setAbortAction(true);
        return;
    }

    // 11. user cannot be modified and is read only in table. So, no need to check for changes.

})(current, previous);
