var user = gs.getUser();
if (current.groups && current.roles) {
	answer = user.hasRole(current.roles) || userIsMemberOfGroups();
} else if (current.groups) {
	answer = userIsMemberOfGroups();
} else if (current.roles) {
	answer = user.hasRole(current.roles);
} else {
	answer = true;
}

function userIsMemberOfGroups() {
	var myGroups = gs.getUser().getMyGroups();
	var currentGroups = current.groups.split(',');
	gs.breaker(myGroups);
	for (var i = 0; i < currentGroups.length; i++) {
		if (myGroups.contains(currentGroups[i]))
			return true;
	}
	return false;
}
