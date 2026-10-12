(function executeRule(current, previous /*null when async*/) {

	gs.eventQueue('kb_feedback_task.reassigned',current,current.assigned_to,gs.getUserDisplayName());

})(current, previous);
