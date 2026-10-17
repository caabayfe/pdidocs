if(gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true') {
	if (gs.hasRole('pa_admin,pa_power_user,dashboard_admin')) {
		answer = true;
	} else if (current.visible_to == '2') {
		if (!current.roles || current.roles === '')
			answer = true;
		else
			answer = gs.hasRole(current.roles);
	} else if (current.visible_to == '3') {
		answer = false;
		if (current.groups && current.groups !== '') {
			var user = gs.getUser(),
			groups = current.groups.split(',');
			for (var i = 0; i < groups.length; i++) {
				if (user.isMemberOf(groups[i])) {
					answer = true;
					break;
				}
			}
		}

		if (!answer && current.users && current.users !== '') {
			var userID = gs.getUserID();
			var users = current.users.split(',');
			for (var j = 0; j < users.length; j++) {
				if (users[j] === userID) {
					answer = true;
					break;
				}
			}
		}

	} else
		answer = false;
}
