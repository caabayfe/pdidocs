var validateSysUserCertificateAttach = new validateSysUserCertificateAttachment(current);

if (validateSysUserCertificateAttach.hasMoreThanOneAttachment()) {
    gs.addErrorMessage(gs.getMessage('Cannot upload more than one PEM certificate.'));
} else if (!validateSysUserCertificateAttach.validateExtensionForPem(current)) {
    gs.addErrorMessage(gs.getMessage('Please upload a certificate  with ".PEM" as file extension.'));
} else {
    action.setRedirectURL(current);

    if (validateSysUserCertificateAttach.hasAttachment()) {
        var fingerPrint = SNC.AuthenticationHelper.normalizeClientCertificate(current);

        if (gs.nil(fingerPrint))
            current.setAbortAction(true);
    }

    current.setWorkflow(false);
    current.update();
    if (!current.isActionAborted())
        action.setRedirectURL(current);
}

if (!validateSysUserCertificateAttach.hasMoreThanOneAttachment())
    validateSysUserCertificateAttach.deleteAttachments(current);
