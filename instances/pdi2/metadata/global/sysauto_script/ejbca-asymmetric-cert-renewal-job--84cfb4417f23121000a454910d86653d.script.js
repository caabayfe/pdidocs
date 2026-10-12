// Checks if a certificate is expiring and marks it as inactive if true.
function checkIfCertIsExpiringAndMarkAsActiveFalse(certSuffix) {
    var certPrefix = 'ejbca_';
    var instanceId = gs.getProperty('instance_id');
    var certName = certPrefix + instanceId + "_" + certSuffix;

    var renewalThresholdDays = parseInt(gs.getProperty("glide.kmf.ejbca_cert.renewal.threshold.days"), 10);
    if (isNaN(renewalThresholdDays)) renewalThresholdDays = 10;

    var certGr = new GlideRecord('sys_certificate');
    certGr.addQuery('name', certName);
    certGr.addActiveQuery();
    certGr.orderByAsc("expires");
    certGr.setLimit(1);
    certGr.query();

    if (certGr.next()) {
        var nowDateTime = new GlideDateTime();
        var expiryDate = certGr.getValue('expires');
        if(gs.nil(expiryDate)) return false;
        var expires_in_days = GlideDateTime.subtract(nowDateTime, new GlideDateTime(expiryDate)).getRoundedDayPart();
        if (expires_in_days > renewalThresholdDays) {
            // Certificate is not expiring in the next threshold days
            return false;
        } else {
            // Deactivating certificate as it is expiring within the threshold days
            certGr.active = false;
            return certGr.update("EJBCA Asymmetric Cert Renewal Job: Marking this expiring certificate inactive to generate a new one.");
        }
    } else {
        // Certificate not found
        return false;
    }
}

var shouldUseBagheeraForCertGeneration = new SNC.KMFAutomationInterface().shouldUseBagheera("KMF_CERT_GENERATION");
if(shouldUseBagheeraForCertGeneration) {
    var isPublicKeyWrapExpiring = checkIfCertIsExpiringAndMarkAsActiveFalse("publickeywrap");
    var isPublicSigVerExpiring = checkIfCertIsExpiringAndMarkAsActiveFalse("publicsigver");
    if(isPublicKeyWrapExpiring || isPublicSigVerExpiring) {
        gs.info("EJBCA Asymmetric Cert Renewal Job: Renewing the EJBCA certificates.");
        (new sn_kmf.KMFInstanceKeyAPI()).ensureAllInstanceInitialKeysExist();
    }
}
