if (gs.getProperty('performanceBypass') == 'true') {
	answer = gs.getProperty('explicitlyShared') == 'true';
} else if ((gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true') && gs.getUser().hasRoles() && new SNC.PADomainUtils().isWriteable("pa_dashboards", current.sys_id)) {
	// Grant writting access to the dashboard admins, owners and when creating new records
	if (gs.hasRole('admin,dashboard_admin') || (gs.getUserID() == current.owner) || !current.isValid()) {
		answer = true;
	} else { // Check current user writting permissions to the dashboard
		var currentUserHasEditAccess = false;
		var ROLE_TYPE_PERMISSION = 1;
		var GROUP_TYPE_PERMISSION = 2;
		var USER_TYPE_PERMISSION = 3;
		var dashboardsPermissions = new GlideRecord('pa_dashboards_permissions');
		dashboardsPermissions.addQuery('dashboard',  current.sys_id);
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
