(function executeRule(current, previous /*null when async*/ ) {
    var abort = false;
    try {
        var validateSysUserCertificateAttach = new validateSysUserCertificateAttachment(current);

        if (validateSysUserCertificateAttach.hasMoreThanOneAttachment()) {
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
            else
                current.publish_status = "exists";
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
