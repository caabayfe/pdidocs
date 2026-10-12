if(gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'false') {
	if (gs.hasRole("pa_admin,pa_power_user,dashboard_admin")) {
		answer = true;
	} else {
		if (current.group && current.group !== '') {
			var gr = new GlideRecord('pa_dashboards_group');
			gr.get(current.group);
			if(gr.visible_to == '2') {
				if(!gr.roles || gr.roles === '')
					answer = true;
				else
					answer = gs.hasRole(gr.roles);
			} else if (gr.visible_to == '3') {
				answer = false;

				if (gr.groups && gr.groups !== '') {
					var user = gs.getUser(),
					groups = gr.groups.split(',');
					for(var i=0;i<groups.length;i++) {
						if(user.isMemberOf(groups[i])) {
							answer = true;
							break;
						}
					}
				}

				if (!answer && gr.users && gr.users !== '') {
					var userId = gs.getUserID();
					answer = gr.users.indexOf(userId) > -1;
				}
			}
		}

		if (current.visible_to == '2') {

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
	}
} else {
	answer = false;
}
