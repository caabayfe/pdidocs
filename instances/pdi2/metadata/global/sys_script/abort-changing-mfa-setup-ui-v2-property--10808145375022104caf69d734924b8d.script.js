(function executeRule(current, previous /*null when async*/) {

	/**
	 * MFA Setup UI Version 2 cannot be disabled when there is an active FIDO2 factor policy.
	 */
	if(SNC.MultifactorAuthUtil.isAnyFidoFactorPolicyActive()) {
		gs.addErrorMessage(gs.getMessage("glide.auth.mfa.ui.v2.enabled cannot be false. There is an active FIDO2 factor policy."));
		gs.error("glide.auth.mfa.ui.v2.enabled cannot be false. There is an active FIDO2 factor policy.");
		current.setAbortAction(true);
	}

})(current, previous);
