(function executeRule(current, previous /*null when async*/) {
	var url = gs.getUrlOnStack();
	// If it is inside the Query Builder UI, we don't want to show the message
	if(url) {
		//Clear any existing info message - this avoids duplicating the message on page refresh
		gs.flushMessages();
		gs.addInfoMessage(gs.getMessage("The number of CIs has reached the maximum allowed."));
	}
})(current, previous);
