(function executeRule(current, previous /*null when async*/) {
	if(SNC.ScriptableSecurityProperties.isRegulatedInstance()) {
		gs.log('Device Encryption cannot be disabled on fedramp instance');
		gs.addErrorMessage(gs.getMessage("You cannot delete this property. Device Encryption is enforced on this instance"));
		current.setAbortAction(true);
	}
})(current, previous);
