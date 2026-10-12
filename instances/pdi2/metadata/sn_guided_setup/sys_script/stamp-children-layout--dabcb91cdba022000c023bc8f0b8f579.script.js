(function executeRule(current, previous /*null when async*/) {
	/*
		Children layout field is stamped and then relationship in content group in validated. This might change in future if more children layots are taken in consideration.
		Stamping is done as this:
		-------------------------
		Root - TILE,
		Children of Root - TABLIST
		Grandchildren of Root - TRAIN
	*/
	if (!new GuidedSetupUtilSNC().stampChildLayoutInContent(current)) {
		current.setAbortAction(true);
	}

})(current, previous);
