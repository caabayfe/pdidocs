var answer = false;
if (gs.hasRole("pa_admin") || gs.hasRole("pa_power_user"))
	answer = true;
else if (current.visible_to == '2' || !current.visible_to) {
    if (current.role_override) {
        answer = true;
    } else if (current.roles && current.roles.trim() !== '') {
        answer = gs.hasRole(current.roles);
    } else {
        answer = false;
    }
} else if (current.visible_to == '3') {
    var user = gs.getUser();

    if (current.groups && current.groups.trim() !== '') {
        var groups = current.groups.split(',');
        for (var i = 0; i < groups.length && !answer; i++) {
            if (user.isMemberOf(groups[i].trim())) {
                answer = true;
            }
        }
    }

    if (!answer && current.users && current.users.trim() !== '') {
        var userID = gs.getUserID();
        var users = current.users.split(',');
        for (var j = 0; j < users.length && !answer; j++) {
            if (users[j].trim() === userID) {
                answer = true;
            }
        }
    }
} else {
    answer = false;
}
