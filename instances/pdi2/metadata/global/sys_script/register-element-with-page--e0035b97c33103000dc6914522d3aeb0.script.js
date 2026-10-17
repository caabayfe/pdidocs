(function executeRule(current, previous /*null when async*/) {
	if (gs.nil(current.parent))
		return;
	
	current.page = current.parent.page;
})(current, previous);
