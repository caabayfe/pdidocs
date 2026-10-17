(function executeRule(current, previous /*null when async*/) {
	var url = gs.getUrlOnStack();
	
	// If it is inside the Multisource UI, we don't want to show the message
	if(url) {
		gs.addInfoMessage(gs.getMessage("This list is showing a portion of the results. Click 'Load More Results' or 'Load All Results' to get more results."));
	}
})(current, previous);
