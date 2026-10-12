(function executeRule(current, previous /*null when async*/) {
	if(TargetLocationHelper.hasChannelCondition(current, 'teams')){
		if(current.target == 'event'){
			gs.addErrorMessage(gs.getMessage("Raise event is only available on web. Select a new option for where to open in Teams."));
			current.setAbortAction(true);
		} else if(current.target == '_parent'){
			gs.addErrorMessage(gs.getMessage("Parent is only available on web. Select a new option for where to open in Teams."));
			current.setAbortAction(true);
		}
	}
})(current, previous);
