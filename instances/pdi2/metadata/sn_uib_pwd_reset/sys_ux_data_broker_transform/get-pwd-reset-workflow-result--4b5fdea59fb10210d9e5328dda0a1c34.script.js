function transform(input) {
	return  new sn_uib_pwd_reset.PwdResetUXFResetProcessor().checkWorkflowResult(input.token,input.contextId);
}
