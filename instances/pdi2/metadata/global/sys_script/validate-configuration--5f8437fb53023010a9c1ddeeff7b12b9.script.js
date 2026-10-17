(function executeRule(current, previous /*null when async*/) {
	var messages = new sn_log.GlideLogConfigBuilder(current).validate();
	if (messages.length > 0) {
		gs.addErrorMessage(gs.getMessage('Invalid logger configuration, reason: [{0}]', messages[0]));
		current.setAbortAction(true);
	}

})(current, previous);
