(function refineQuery(current, parent) {

	var emAiInsight = new EmAiInsight();
	emAiInsight.getRelatedTaskResultsByType(current, parent, "incident");
	
})(current, parent);
