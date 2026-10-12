(function executeRule(current, previous /*null when async*/ ) {
    try {
        var factorType = '';
        if (current.name == 'glide.authenticate.multifactor.email.otp.enabled')
            factorType = '8ff949fec30011102c5b4e483c40dd34'; //EMAIL
        else if (current.name == 'glide.webauthn.enabled')
            factorType = 'ec8a1c35771002104bb41646ba5a99e0'; //FIDO
        if (GlideStringUtil.notNil(factorType)) {
            SNC.MultifactorAuthUtil.clearRecentUsedFactorDataOnDisablingFactorProperty(factorType);
            gs.addInfoMessage(gs.getMessage('Recent Factor details removed for the users on disabling the factor property.'));
        }
    } catch (e) {
        gs.error("RemoveTotpAndFidoRecenFactorSetupDetails: error occured while removing recent factor: "+ factorType + " details during deactivating the factor property, error: " + e);
    }
})(current, previous);
