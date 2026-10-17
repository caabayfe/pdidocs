(function executeRule(current, previous /*null when async*/ ) {
    var abort = false;
    try {
        var validateSysUserCertificateAttach = new validateSysUserCertificateAttachment(current);
        var grCount = new GlideAggregate('sys_ca_certificate');
        grCount.addQuery('type', '=','trust_store_ca');
        grCount.addAggregate('COUNT');
        grCount.query();
        
        if (grCount.next() && parseInt(grCount.getAggregate('COUNT')) >= gs.getProperty('glide.authenticate.mutual.max.limit.ca.certificate', 150)) {
            gs.addErrorMessage(gs.getMessage('Reached max limit For CA Certificates: ' + grCount.getAggregate('COUNT')));
            abort = true;
        } else if (validateSysUserCertificateAttach.hasMoreThanOneAttachment()) {
            gs.addErrorMessage(gs.getMessage('Cannot upload more than one PEM certificate.'));
            abort = true;
        } else if (!validateSysUserCertificateAttach.hasAttachment() ||
            !validateSysUserCertificateAttach.validateExtensionForPem(current)) {
            gs.addErrorMessage(gs.getMessage('Please upload a certificate  with ".PEM" as file extension.'));
            abort = true;
        } else {
            var fingerPrint = SNC.AuthenticationHelper.normalizeCACertificate(current);

            if (gs.nil(fingerPrint))
                abort = true;
            else {
                var glideCACertificateUploader = new SNC.GlideCACertificateUploader();
                var status = glideCACertificateUploader.addCACertificate(current);

                if (status)
                    current.publish_status = "queued";
                else {
                    gs.addErrorMessage(gs.getMessage('Unable to upload the certificate. Please check system logs for more information.'));
                    abort = true;
                }
            }
        }

        if (!validateSysUserCertificateAttach.hasMoreThanOneAttachment())
            validateSysUserCertificateAttach.deleteAttachments(current);
    } catch (e) {
        gs.error("Error Occurred : " + e);
        abort = true;
    }

    if (abort) {
        current.setAbortAction(abort);
    }
})(current, previous);
