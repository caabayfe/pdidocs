(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addInfoMessage(gs.getMessage("Refreshing... {0}%", current.percentage));
})(current, previous);
