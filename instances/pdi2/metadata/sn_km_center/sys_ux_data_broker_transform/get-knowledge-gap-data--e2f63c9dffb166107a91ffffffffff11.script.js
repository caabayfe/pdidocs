function transform(input) {
	var taskData = new sn_km_gen_ai.KnowledgeGap().getTaskData(input.selectedSysIds);
	return taskData;
}
