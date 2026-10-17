(function executeRule(current, previous /*null when async*/ ) {
    var fidoFactorTypeSysId = 'ec8a1c35771002104bb41646ba5a99e0'; //FIDO
    try {
        if (current.operation() == 'delete' || (current.operation() == 'update' && current.active == false)) {
            SNC.MultifactorAuthUtil.removeRecentUsedFactorForUser(current.user, fidoFactorTypeSysId);
        } else if (current.operation() == 'update' && current.active == true) {
            SNC.MultifactorAuthUtil.updateRecentUsedFactorForUser(current.user, fidoFactorTypeSysId);
        }
    } catch (e) {
		gs.error("SyncFidoFactorSetupDetails: error occured while updating the FIDO factor details for the user:" + current.user + ", error: " + e);
    }
})(current, previous);
