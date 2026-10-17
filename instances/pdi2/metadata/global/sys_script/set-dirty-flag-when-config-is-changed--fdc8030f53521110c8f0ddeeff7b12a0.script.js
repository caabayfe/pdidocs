(function executeRule(current, previous /*null when async*/ ) {
    
	SNC.ProcessOptimization.setDirty(current.getValue("project"), false);
	
})(current, previous);
