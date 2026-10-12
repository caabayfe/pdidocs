(function executeRule(current, previous /*null when async*/ ) {
    var reservedClaims = gs.getProperty('glide.oauth.jwt.reserved_claim_set', 'iss,sub,aud,exp,iat');
    var jtiClaim = current.getValue('jti_claim');
    var reservedClaimList = reservedClaims.split(',');
    
    if (jtiClaim && reservedClaimList.includes(jtiClaim)) {
        gs.addErrorMessage(gs.getMessage("Reserved claim '{0}' can't be used as jti claim name", jtiClaim));
        current.setAbortAction(true);
    }

})(current, previous);
