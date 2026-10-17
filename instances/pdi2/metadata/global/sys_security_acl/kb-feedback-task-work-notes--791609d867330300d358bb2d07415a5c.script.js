var user = gs.getUserID();
var kbFeedbackTask = new KBFeedbackTask();
answer = kbFeedbackTask.hasElevatedAccess(current) || user == current.assigned_to || (current.feedback && (user == current.feedback.article.author || user == current.feedback.article.revised_by)) || (user==current.opened_by && gs.hasRole('sn_km_ml.knowledge_curation_user'));
