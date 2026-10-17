function transform(input) {
    const ciUtils = new sn_oe_sfs.CIUtil();
    const response = {
        'isDataPrivacyInstalled': ciUtils.isDataPrivacyInstalled(),
        'isDataPrivacyForVASupported': ciUtils.isDataPrivacyForVASupported()
    };
    return response;
}
