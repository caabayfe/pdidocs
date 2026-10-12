if (new PAUtils().getParamFromGlideURI("sysparm_collection_related_file") == "pa_indicators" || 
		new PAUtils().getParamFromGlideURI("sysparm_record_target") == "sysauto_pa" ||
		gs.hasRole("pa_admin") || gs.hasRole("pa_power_user"))
	answer = true;
else if (!current.visible_to || current.visible_to == '2') {
	if (current.role_override)
		answer = true;
	else if (!current.roles || current.roles === '')
		answer = false;
	else
		answer = gs.hasRole(current.roles);

} else if (current.visible_to == '3') {
	answer = false;

	if (current.groups && current.groups !== '') {
		var user = gs.getUser(),
			groups = current.groups.split(',');
		for (var i = 0; i < groups.length; i++) {
			answer = user.isMemberOf(groups[i]);
			if (answer)
				break;
		}
	}

	if (!answer && current.users && current.users !== '') {
		var userID = gs.getUserID(),
			users = current.users.split(',');
		for (var j = 0; j < users.length; j++) {
			answer = users[j] === userID;
			if (answer)
				break;
		}
	}

} else {
	answer = false;
}
