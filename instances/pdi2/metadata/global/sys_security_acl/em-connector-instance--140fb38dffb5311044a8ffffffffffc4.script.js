var answer = getAnswer();

function getAnswer() {
	// if user is not evt_team_operator return true from script in order to follow the Requires role
	// if user is evt_team_operator will continue to check groups
    if (!gs.getUser().hasRole("evt_team_operator"))
        return true;

    // Get user groups that current user is the member of or is the manager of
    // userGroups is List of group id's
    var userGroups = new global.ConnectorInstanceUtil().getCurrentUserGroupsForMemberOrManager();

    if (userGroups.indexOf(current.getValue("assignment_group")) !== -1)
        return true;
    return false;
}
