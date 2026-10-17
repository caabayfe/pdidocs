function transform(input) {
	return new sn_uib_pwd_reset.PwdResetUXFVerifyProcessor().verifyAllVerifications(input.token, input.reqDetail);
}
