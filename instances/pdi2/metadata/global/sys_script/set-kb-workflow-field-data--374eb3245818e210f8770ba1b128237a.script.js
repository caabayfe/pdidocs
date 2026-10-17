(function executeRule(current, previous /*null when async*/) {
	
	var knowledgeUIActionAPI = new global.KnowledgeUIAction();
	g_scratchpad.isKBWorkflowActive = knowledgeUIActionAPI.isKBWorkflowFieldActive();

})(current, previous);
