answer = false;
var assignedUser = current.incident_ref.assigned_to;
var loggedInUserId = gs.getUserID();
var role = "itil";
if (GlidePluginManager.isActive('com.snc.itsm.roles'))
    role += ", sn_incident_write";
if (gs.hasRole(role) || assignedUser == loggedInUserId || gs.hasRole('major_incident_manager')) {
    answer = true;
}
