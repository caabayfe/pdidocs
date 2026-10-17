var user = gs.getUserID();
var kbFeedbackTask = new KBFeedbackTask();
answer =  user == current.assigned_to ||  user == current.opened_by || kbFeedbackTask.hasElevatedAccessForOwnershipGroup(current);
