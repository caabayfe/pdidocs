function transform(input) {
	return  new sn_uib_pwd_reset.PwdResetUXFResetProcessor().checkWorkflowProgress(input.token,input.contextId);
}
