if (GlideSession.get().getProperty('performanceBypass') == 'true') {
	answer = false;
} else if ((gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true') && gs.getUser().hasRoles() && new SNC.PADomainUtils().isWriteable("pa_dashboards", current.sys_id)) {
	if (gs.hasRole('admin,dashboard_admin') || (gs.getUserID() == current.owner)) {
		answer = true;
	} else {
		var currentUserHasEditAccess = false;
		//Grant access to the dashboard creator and editor
		//Check current user permissions to delete the dashboard
		var ROLE_TYPE_PERMISSION = 1;
		var GROUP_TYPE_PERMISSION = 2;
		var USER_TYPE_PERMISSION = 3;
		var dashboardsPermissions = new GlideRecord('pa_dashboards_permissions');
		dashboardsPermissions.addQuery('dashboard',  current.sys_id);
		dashboardsPermissions.addQuery('delete',  true);
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
 
			if (currentUserHasEditAccess)
				break;
		}
		answer = currentUserHasEditAccess;
	}
} else {
	answer = false;
}
