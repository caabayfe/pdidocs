function transform(input) {
	var result = new sn_uib_pwd_reset.PwdResetUXFIdentifyProcessor().getProcess(input.userSysId);
	return result;
}
