function transform(input) {
	return new sn_uib_pwd_reset.PwdResetCommonUXFVerificationProcessor().getPersonalConfirmationVerificationDetails(input.verificationId, input.token);
}
