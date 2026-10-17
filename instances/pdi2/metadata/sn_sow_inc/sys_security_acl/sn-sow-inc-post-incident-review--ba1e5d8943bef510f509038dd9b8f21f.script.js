answer = false;
var assignedUser = current.incident_ref.assigned_to;
var loggedInUserId = gs.getUserID();
var role = "itil";
if (GlidePluginManager.isActive('com.snc.itsm.roles'))
    role += ", sn_incident_write";
if (gs.hasRole('major_incident_manager') || assignedUser == loggedInUserId || gs.hasRole(role)) {
    answer = true;
} else {
    var coAuthors = current.co_authors;
    if (coAuthors.includes(loggedInUserId)) {
        answer = true;
    }
}
