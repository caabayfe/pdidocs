var user = gs.getUserID();
var kbFeedbackTask = new KBFeedbackTask();
answer = kbFeedbackTask.hasElevatedAccess(current) || user == current.opened_by;
