(function executeRule(current, previous /*null when async*/) {	
	if(TargetLocationHelper.hasChannelCondition(current, 'mweb')){
		if(current.target == '_blank'){
			gs.addInfoMessage(gs.getMessage("For web, this link will open in a new browser tab."));
		} else if(current.target == 'popup'){
			gs.addInfoMessage(gs.getMessage("For web, this link will open in a web pop-up."));
		}else if(current.target == '_top'){
			gs.addInfoMessage(gs.getMessage("For web, this link will open by refreshing the topmost browser frame."));
		} else if(current.target == 'event'){
			gs.addInfoMessage(gs.getMessage("For web, this link will open by sending a raise event to other browser windows."));
		} else if(current.target == '_parent'){
			gs.addInfoMessage(gs.getMessage("For web, this link will open by refreshing the parent of the current browser frame."));
		}
	}
})(current, previous);
