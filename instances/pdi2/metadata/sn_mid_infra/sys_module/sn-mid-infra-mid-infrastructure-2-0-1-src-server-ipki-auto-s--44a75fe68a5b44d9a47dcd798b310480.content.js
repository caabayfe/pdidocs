// The clean up logic cleans code that is:
// 1. Created more than 24 hours ago - we do not want to clean up certificates that are still to be used
// 2. Belongs to MID IPKI endpoint - we only want to clean up the sys_kmf_certificate records that are owned by our app
// 3. Created for MID server - we want to clean up the sys_kmf_certificate records that are meant for mid server
// 4. Not in use on any mid server - no mid server should be still using it's public key actively
// 5. Not mapped to any mid server

// clean up mapping table first. We will use this to clean up the sys_kmf_certificate records that are not mapped to any mid server
var ipkiCertMapManager = new IPKICertMapManager();
ipkiCertMapManager.cleanup();

var cleanupOlderThanMinutes = 1440; // 24 hours

// Get mapped KMF certificates from records that are not inactive.
var mappedKmfCertSysIds = ipkiCertMapManager.getReferencedKmfCertSysIds('state!=' + ipkiCertMapManager.STATE.INACTIVE);

// Query for KMF certificates that are candidates for revocation.
var staleCertCandidateGR = new GlideRecord('sys_kmf_certificate');
staleCertCandidateGR.addEncodedQuery('sys_created_on<javascript:gs.minutesAgo(' + cleanupOlderThanMinutes + ')');
staleCertCandidateGR.addNullQuery('revocation_date');
staleCertCandidateGR.addQuery("sys_name", "MID");

// only look at certificates that belong to our IPKI endpoint
staleCertCandidateGR.addQuery("ipki_endpoint", ipkiCertMapManager.IPKI_ENDPOINT_SYS_ID);

gs.debug('IPKI Cleanup: Found ' + mappedKmfCertSysIds.length + ' unique KMF certificate(s) in the certificate mapping table.');
if (mappedKmfCertSysIds.length > 0) {
    staleCertCandidateGR.addQuery('sys_id', 'NOT IN', mappedKmfCertSysIds.join(','));
}

staleCertCandidateGR.query();

// Collect the sys_ids of all certificates that match the cleanup criteria.
var certsToRevoke = [];
var kmfCertUtil = new KMFCertificateUtility();
while (staleCertCandidateGR.next()) {

    if (!kmfCertUtil.isIpkiMidCertificate(staleCertCandidateGR))
        continue;
    
    // Skip certificates that are already revoked
    if (kmfCertUtil.isRevoked(staleCertCandidateGR))
        continue;
    
    certsToRevoke.push(staleCertCandidateGR.getUniqueValue());
}

// If any certificates are found, revoke them using the CsrValidationEndpoint utility.
if (certsToRevoke.length > 0) {
    try {
        var csrValidationEndpoint = new CsrValidationEndpoint(ipkiCertMapManager.IPKI_ENDPOINT_NAME);
        csrValidationEndpoint.revokeCertificates(certsToRevoke, csrValidationEndpoint.REVOCATION_REASON.CESSATION_OF_OPERATION);
        gs.info('IPKI Cleanup: Successfully revoked ' + certsToRevoke.length + ' stale certificate(s): ' + certsToRevoke.join(', ') + '.');
    } catch (e) {
        gs.error('IPKI Cleanup: Failed to revoke stale certificates. Error: ' + e.message);
    }
} else {
    gs.debug('IPKI Cleanup: No stale certificates found requiring revocation.');
}
