(function refineQuery(current, parent) {

	var emAiInsight = new EmAiInsight();
	emAiInsight.getRelatedTaskResultsByType(current, parent, "problem");
	
})(current, parent);
