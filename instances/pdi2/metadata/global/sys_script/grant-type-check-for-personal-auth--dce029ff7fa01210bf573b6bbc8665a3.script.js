(function executeRule(current, previous /*null when async*/) {

	gs.addErrorMessage(gs.getMessage("Personal Authentication option is supported only when the grant type is 'Resource Owner Password Credentials' or 'Authorization Code'."));
	current.setAbortAction(true);

})(current, previous);
