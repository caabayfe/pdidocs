(function executeRule(current, previous /*null when async*/) {
	var lastActualUpdatedTime = new TargetProgressUtil(current).getLastActualUpdated();
	if(lastActualUpdatedTime)
		g_scratchpad.lastActualUpdated = gs.getMessage("Last updated: {0}", lastActualUpdatedTime);
	
})(current, previous);
