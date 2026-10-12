function transform(input) {
	return  new sn_uib_pwd_reset.PwdResetUXFResetProcessor().startResetFlow(input.token,input.newPassword);
}
