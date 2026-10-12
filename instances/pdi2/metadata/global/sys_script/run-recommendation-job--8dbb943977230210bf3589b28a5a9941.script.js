(function executeRule(current, previous /*null when async*/) {

	SNC.ProcessOptimization.runActivityRecommendations(current.getUniqueValue());

})(current, previous);
