var user = gs.getUserID();
var kbFeedbackTask = new KBFeedbackTask();
answer =  user == current.assigned_to || kbFeedbackTask.hasElevatedAccessForOwnershipGroup(current) || (user==current.opened_by && gs.hasRole('sn_km_ml.knowledge_curation_user'));
