if (gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true' && gs.getUser().hasRoles()) {
	// Grant write access to dashboard admins and its owner
	if (gs.hasRole('admin,dashboard_admin') || (gs.getUserID() == current.dashboard.owner)) {
		answer = true;
	} else { //Check current user write permissions to the dashboard
		var currentUserHasEditAccess = false;
		var ROLE_TYPE_PERMISSION = 1;
		var GROUP_TYPE_PERMISSION = 2;
		var USER_TYPE_PERMISSION = 3;

		var dashboardsPermissions = new GlideRecord('pa_dashboards_permissions');
		dashboardsPermissions.addQuery('dashboard',  current.dashboard);
		dashboardsPermissions.addQuery('write',  true);
		dashboardsPermissions.orderBy('type');
		dashboardsPermissions.query();
		while (dashboardsPermissions.next()) {
			var identityType = parseInt(dashboardsPermissions.getValue('type'));
			var identitySysId = dashboardsPermissions.getValue('identity');
			switch (identityType) {
			  case ROLE_TYPE_PERMISSION:
				currentUserHasEditAccess = gs.hasRole(identitySysId);
				break;
			  case GROUP_TYPE_PERMISSION:
				currentUserHasEditAccess = gs.getUser().isMemberOf(identitySysId);
				break;
			  case USER_TYPE_PERMISSION:
				currentUserHasEditAccess = gs.getUserID() == identitySysId;
				break;
			  default:
				break;
			}
			if (currentUserHasEditAccess) {
				break;
			}
		}
		answer = currentUserHasEditAccess;
	}
} else {
	answer = false;
}
