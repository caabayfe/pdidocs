answer = false;
var assignedUser = current.incident_ref.assigned_to;
var loggedInUserId = gs.getUserID();
if (gs.hasRole('major_incident_manager') || assignedUser == loggedInUserId) {
    answer = true;
} else {
    var coAuthors = current.co_authors;
    if (coAuthors.includes(loggedInUserId)) {
        answer = true;
    }
}
