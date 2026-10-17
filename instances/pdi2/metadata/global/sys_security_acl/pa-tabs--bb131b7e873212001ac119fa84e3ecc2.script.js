if ((gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true') && gs.getUser().hasRoles() && new SNC.PADomainUtils().isWriteable("pa_tabs", current.sys_id)) {
	if (gs.hasRole('admin,dashboard_admin')) {
		answer = true;
	} else {
		var currentUserHasEditAccess = false;
		var isOwner = false;
		var m2mTabs = new GlideRecord("pa_m2m_dashboard_tabs");
		if (m2mTabs.get('tab', current.sys_id)) {
			isOwner = m2mTabs.dashboard.owner == gs.getUserID();
			if (!isOwner) {
				//Check current user delete permissions to the dashboard
				var ROLE_TYPE_PERMISSION = 1;
				var GROUP_TYPE_PERMISSION = 2;
				var USER_TYPE_PERMISSION = 3;
				var dashboardsPermissions = new GlideRecord('pa_dashboards_permissions');
				dashboardsPermissions.addQuery('dashboard', m2mTabs.dashboard);
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
			}
		}
		answer = isOwner || currentUserHasEditAccess;
	}
} else {
	answer = false;
}
