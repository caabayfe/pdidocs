(function executeRule(current, previous /*null when async*/) {

	SNC.ProcessOptimization.scheduleActivityRecommendations(current.getValue("table"));

})(current, previous);
