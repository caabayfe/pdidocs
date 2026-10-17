(function onBefore(current, previous /*null when async*/) {
	if (previous.web_ext) { //if it had changed and was perviously a diffrent one
		if (previous.web_ext != current.web_ext) {
			current.setAbortAction(true);
			gs.addInfoMessage(gs.getMessage("Cannot change the MID Web Server Extension after it has been saved."));
		}
	}	
})(current, previous);
