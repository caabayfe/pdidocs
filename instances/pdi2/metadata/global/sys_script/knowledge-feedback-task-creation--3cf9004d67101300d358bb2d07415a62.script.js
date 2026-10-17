(function executeRule(current, previous /*null when async*/) {

	var feedback_obj = {};
	feedback_obj.feedback = current.sys_id;
	if(current.comments)
		feedback_obj.description = current.comments;
	else if(current.useful == "no")
		feedback_obj.description = gs.getMessage("{0} was marked as not helpful",current.article.getDisplayValue());
	else
		feedback_obj.description = gs.getMessage("{0} was rated low",current.article.getDisplayValue());
	new KBFeedbackTask().createFeedbackTask(feedback_obj, current.flagged);

})(current, previous);
