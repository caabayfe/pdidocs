(function executeRule(current, previous /*null when async*/) {

	// Set the Feedback provider to reference the current session user
	current.setValue("feedback_provider", gs.getUserID());
	
	// set the feedback provider persona to be Task assignee if the agent is updating the feedback
	if (current.ai_search_result.task_id.assigned_to == gs.getUserID())
		current.setValue("feedback_provider_persona", "task_assignee");	

})(current, previous);
