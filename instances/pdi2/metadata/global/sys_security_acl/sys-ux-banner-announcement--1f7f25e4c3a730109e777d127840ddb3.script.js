var answer = true;
var user = gs.getUser();
var currentTime = new GlideDateTime();
var startDate = new GlideDateTime(current.getValue('start'));
var endDate = new GlideDateTime(current.getValue('end'));
var sessionTimeout = gs.getProperty('glide.ui.session_timeout');
currentTime.addSeconds(sessionTimeout * 60);
var announcementWindow = currentTime.getValue();
var isAnnouncementActive = (startDate < announcementWindow) && (endDate > currentTime.getValue() || !endDate);
var show_for = current.getValue('show_for');

//restrict access when announcement is not active
if (!isAnnouncementActive) {
	answer = false;
}

//restrict access when user does not have roles/groups
else if (show_for == 'specified_users') {
	var ann_roles = current.getDisplayValue('roles');
	var ann_groups = current.getValue('group');
	ann_roles = (ann_roles == "") ?  [] : ann_roles.split(', ');
	ann_groups = (ann_groups == null) ? [] : ann_groups.split(',');
	
	var userHasRole = false;
	var userHasGroup = false;
	
		//Give user access if it has valid role
		for (i = 0; i < ann_roles.length; i++) {
			var role = ann_roles[i];
			if (user.hasRole(role)) {
				userHasRole = true;
				break;
			}
		}

		if (!userHasRole) {
			//Give user access if it has valid group
			for (i = 0; i < ann_groups.length; i++) {
				var group = ann_groups[i];
				if (user.isMemberOf(group)) {
					userHasGroup = true;
					break;
				}
			}
		}
		if (!userHasRole && !userHasGroup) {
			answer = false;	
		}
}
