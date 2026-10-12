answer = false;
var feedbackTaskGr = new GlideRecord("kb_feedback_task");
if(feedbackTaskGr.get(current.kft_sys_id)){
	answer = new KBFeedbackTask().hasElevatedAccess(feedbackTaskGr);
}
