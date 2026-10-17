function transform(input) {
	return new sn_uib_pwd_reset.PwdResetUXFVerifyProcessor().getPageInfo(input.token, input.workspace);
}
