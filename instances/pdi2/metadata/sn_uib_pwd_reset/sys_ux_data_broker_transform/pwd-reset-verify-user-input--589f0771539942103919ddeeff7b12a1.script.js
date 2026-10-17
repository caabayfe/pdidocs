function transform(input) {
	return new sn_uib_pwd_reset.PwdResetUXFVerifyProcessor().verifyUser(input.token, input.verificationId, input.reqDetail);
	
}
