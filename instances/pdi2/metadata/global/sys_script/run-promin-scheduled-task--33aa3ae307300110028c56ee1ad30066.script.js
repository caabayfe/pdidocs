(function executeRule(current, previous /*null when async*/) {

	SNC.ProcessOptimization.runScheduledTask(current.getUniqueValue());

})(current, previous);
