(function executeRule(current, previous /*null when async*/ ) {
    try {
        var totpFactorTypeSysId = 'eeba5075771002104bb41646ba5a9923'; //TOTP
        if (current.operation() == 'delete' || (current.operation() == 'update' && current.is_validated == false)) {
            SNC.MultifactorAuthUtil.removeRecentUsedFactorForUser(current.user, totpFactorTypeSysId);
        } else if (current.operation() == 'update' && current.is_validated == true) {
            SNC.MultifactorAuthUtil.updateRecentUsedFactorForUser(current.user, totpFactorTypeSysId);
        }
    } catch (e) {
        gs.error("SyncTotpFactorSetupDetails: error occured while setting the TOTP recent factor for user:" + current.user + ", error: " + e);
    }
})(current, previous);
