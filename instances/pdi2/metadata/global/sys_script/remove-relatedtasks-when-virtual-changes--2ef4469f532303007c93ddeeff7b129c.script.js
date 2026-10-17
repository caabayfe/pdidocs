(function executeRule(current, previous /*null when async*/) {
	var alertManager = new SNC.AlertManager();
	alertManager.addStep("Alert BR: Remove relatedTasks when virtual changes (after)");
	var emAiInsight = new EmAiInsightCommon();
	emAiInsight.removeStateRecord(current.sys_id);

})(current, previous);
