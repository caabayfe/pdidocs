function transform(input) {
	var experienceProperties = input.experienceProperties || {};
	var knowledgeTable = experienceProperties.knowledge_table || {};
	var knowledgeRecord = experienceProperties.knowledge_record || {};
	
	return {
		knowledgeTable: knowledgeTable.value || "",
		knowledgeRecord: knowledgeRecord.value || ""
	};
}
