(function executeRule(current, previous /*null when async*/) {
	if(TargetLocationHelper.hasChannelCondition(current, 'slack')){
		gs.addErrorMessage(gs.getMessage("Link settings are currently not supported in Slack."));
		current.setAbortAction(true);
	}
})(current, previous);
