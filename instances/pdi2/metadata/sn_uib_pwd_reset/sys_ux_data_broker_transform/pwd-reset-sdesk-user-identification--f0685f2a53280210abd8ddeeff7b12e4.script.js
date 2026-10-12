function transform(input) {
	var result = new sn_uib_pwd_reset.PwdResetUXFIdentifyProcessor().identifyUser(input.userSysId, input.processSysId, input.token);
	return result;
}
