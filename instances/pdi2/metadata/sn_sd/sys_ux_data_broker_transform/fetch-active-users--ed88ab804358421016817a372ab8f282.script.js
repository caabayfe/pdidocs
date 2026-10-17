function transform(input) {
    var rolesUtility = new SDRolesUtility();
    var userIdsWithRole = [];

    // Collect non-inherited user IDs
    if (input.users && input.users.length > 0) {
        for (var i = 0; i < input.users.length; i++) {
            var user = input.users[i];
            if (user.inherited === 'false') {
                userIdsWithRole.push(user.userId);
            }
        }
    }

    // Get active users matching the search term
    var searchTerm = input.searchUserTerm || "";
    var usersList = rolesUtility.getActiveUsersList(searchTerm);

    // Mark already-assigned users as disabled
    for (var j = 0; j < usersList.length; j++) {
        if (userIdsWithRole.indexOf(usersList[j].id) > -1) {
            usersList[j].disabled = true;
        }
    }

    return {
        usersList: usersList
    };
}
