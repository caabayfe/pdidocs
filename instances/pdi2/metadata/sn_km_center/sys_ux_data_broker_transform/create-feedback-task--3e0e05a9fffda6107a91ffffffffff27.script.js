function transform(input) {
	if (!input.selectedSysIds.length || !input.description) {
		return;
	}
	
	var results = new sn_km_gen_ai.KnowledgeGap().createFeedbackTask(input.selectedSysIds, input.description);
	return results;
}
