var user = gs.getUserID();
var kbFeedbackTask = new KBFeedbackTask();
answer = kbFeedbackTask.hasElevatedAccess(current) || user == current.assigned_to || user == current.opened_by || (current.feedback && (user == current.feedback.article.author || user == current.feedback.article.revised_by));
