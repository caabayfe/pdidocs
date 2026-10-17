gs.include('validators');
if (current.getTableName() == "problem") {
    current.work_notes = "reply from: " + email.origemail + "\n\n" + email.body_text;
    if (current.canWrite()) {
        if (email.body.assign != undefined) {
            if (canAssignProblemToUser(email.body.assign)) {
                current.assigned_to = email.body.assign;
            }
        }
        current.update();
    }
    //Priority field on problem should not be updated directly, so that code logic is removed
}

function canAssignProblemToUser(assignedTo) {
    var gr = new GlideRecord("sys_user");
    gr.addQuery("name", assignedTo);
    gr.query();
    while (gr.next()) {
        var user = gs.getUser().getUserByID(gr.getUniqueValue());
        var requiredRole = GlidePluginManager.isActive("com.snc.best_practice.problem.madrid") ? 'problem_coordinator' : 'itil';
        if (!user.hasRole(requiredRole)) {
            gs.info("Log from Update Problem email action "+requiredRole + " role is missing for " + assignedTo + " user");
            return false;
        }
        return true;
    }
    return false;
}
