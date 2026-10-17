(function executeRule(current, previous /*null when async*/) {
	if(TargetLocationHelper.hasChannelCondition(current, 'teams')){
		if(current.target == '_blank'){
			gs.addInfoMessage(gs.getMessage("For Teams, this link will open in a new browser tab."));
		} else if(current.target == 'popup'){
			gs.addInfoMessage(gs.getMessage("For Teams, this link will open in a Teams pop-up. It must be a ServiceNow link."));
		} else if(current.target == '_top'){
			gs.addInfoMessage(gs.getMessage("For Teams, this link will open in a Teams tab. It must be a ServiceNow link."));
		}
	}
})(current, previous);
