(function executeRule(current, previous /*null when async*/) {

	SNC.ProcessOptimization.setDirty(current.getUniqueValue(), true);

})(current, previous);
