(function executeRule(current, previous /*null when async*/) {

	SNC.ProcessOptimization.deleteProject(current.getUniqueValue());

})(current, previous);
