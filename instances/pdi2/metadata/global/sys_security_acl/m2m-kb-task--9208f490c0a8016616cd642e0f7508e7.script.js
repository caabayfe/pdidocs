var canReadArticle = false;var canReadTask =  false;
if (current.isNewRecord()) {
	answer = true;
} else if (current.kb_knowledge) {
	var gr = new GlideRecord('kb_knowledge');
	gr.setWorkflow(false);
	if (gr.get(current.kb_knowledge.sys_id))
		canReadArticle = gr.canRead();
	
	var grTask = new GlideRecord("task");
	gr.setWorkflow(false);
	if(grTask.get(current.task.sys_id))
		canReadTask  = grTask.canRead();
	
	answer  = canReadArticle && canReadTask;
} else
	answer = false;
