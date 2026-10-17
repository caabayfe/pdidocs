var user = gs.getUserID();
var kbFeedbackTask = new KBFeedbackTask();
answer = kbFeedbackTask.hasElevatedAccess(current) || user == current.assigned_to || (user==current.opened_by && gs.hasRole('sn_km_ml.knowledge_curation_user'));
