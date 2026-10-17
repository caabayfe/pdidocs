(function(){
	//Allow access to assignee and submitter
	var user = gs.getUserID();
	if(current.assigned_to == user || current.opened_by == user)
		return true;
	
	//Allow access if can contribute to an article on which feedback is reported
	if(current.feedback && current.feedback.article){
		var knowledgeHelper = new SNC.KnowledgeHelper();
		return knowledgeHelper.canContribute(current.feedback.article.getRefRecord());
	}
	
	//Allow access if can read the parent task record
	if(current.parent){
		var gr = new GlideRecord('task');
		if(gr.get(current.parent)){
			return gr.canRead();
		}
	}

	//Allow access if task got created from demand insight using report knowledge gap for admin user
	if(current.feedback_task_type == "3" && gs.hasRole("admin"))
		return true;

	return false;
})();
