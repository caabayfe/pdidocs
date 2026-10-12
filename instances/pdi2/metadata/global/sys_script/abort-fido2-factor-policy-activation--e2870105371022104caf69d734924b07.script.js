(function executeRule(current, previous /*null when async*/) {

	/**
	 * FIDO2 factor policy is not supported for MFA Setup UI Version 2 i.e. when glide.auth.mfa.ui.v2.enabled sys property is false.
	 */
	if(SNC.MultifactorAuthUtil.isFidoFactorPolicy(current.sys_id) && !GlideProperties.getBoolean("glide.auth.mfa.ui.v2.enabled", false)) {
		gs.addErrorMessage(gs.getMessage("The FIDO2 factor policy cannot be active. glide.auth.mfa.ui.v2.enabled system property has to be true."));
		gs.error("The FIDO2 factor policy cannot be active. glide.auth.mfa.ui.v2.enabled system property has to be true.");
		current.setAbortAction(true);
	}

})(current, previous);
