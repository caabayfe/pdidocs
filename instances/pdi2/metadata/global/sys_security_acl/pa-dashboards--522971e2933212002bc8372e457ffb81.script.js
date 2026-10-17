if (gs.getProperty('performanceBypass') == 'true') {
	answer = gs.getProperty('explicitlyShared') == 'true';
} else if(gs.getProperty('glide.cms.enable.responsive_grid_layout', 'true') === 'true') {
	// Grant access to dashboard admins, owner and when creating a new record
	if (gs.hasRole('dashboard_admin') || (gs.getUserID() == current.owner) || !current.isValid()) {
		answer = true;
	} else { // Check access from dashboard group and the dashboard itself
			var restrictToRoles = current.restrict_to_roles;
			var hasRestrictedRole = (restrictToRoles && restrictToRoles !== '') ? gs.hasRole(restrictToRoles) : true;
			var hasGroup = current.group && current.group !== '';
			var hasReadAccessFromGroup = false;

			if (hasGroup) {
				var gr = new GlideRecord('pa_dashboards_group');
				gr.get(current.group);
				if (gr.isValid())
					hasReadAccessFromGroup = gr.canRead();
			}

			//Check current user read permissions to the dashboard
			var hasExplicitDashboardPermission = false;
			var hasReadAccessFromDashboard = false;

			var ROLE_TYPE_PERMISSION = 1;
			var GROUP_TYPE_PERMISSION = 2;
			var USER_TYPE_PERMISSION = 3;

			var dashboardsPermissions = new GlideRecord('pa_dashboards_permissions');
			dashboardsPermissions.addQuery('dashboard',  current.sys_id);
			dashboardsPermissions.addQuery('read',  true);
			dashboardsPermissions.orderBy('type');
			dashboardsPermissions.query();

			while (dashboardsPermissions.next()) {
				hasExplicitDashboardPermission = true;

				var identityType = parseInt(dashboardsPermissions.getValue('type'));
				var identitySysId = dashboardsPermissions.getValue('identity');

				switch (identityType) {
					case ROLE_TYPE_PERMISSION:
						hasReadAccessFromDashboard = gs.hasRole(identitySysId);
						break;
					case GROUP_TYPE_PERMISSION:
						hasReadAccessFromDashboard = gs.getUser().isMemberOf(identitySysId);
						break;
					case USER_TYPE_PERMISSION:
						hasReadAccessFromDashboard = gs.getUserID() == identitySysId;
						break;
					default:
						break;
				}

				if (hasReadAccessFromDashboard)
					break;
			}
			if (hasRestrictedRole) {
				answer = (hasExplicitDashboardPermission? hasReadAccessFromDashboard: hasReadAccessFromGroup);
				if (!answer) {
					// Check for write permissions
					// When migrating permissions for pa_admin and pa_power_user in order to respect dashboard group permissions, they receive only write access at the dash level
					dashboardsPermissions = new GlideRecord('pa_dashboards_permissions');
					dashboardsPermissions.addQuery('dashboard',  current.sys_id);
					dashboardsPermissions.addQuery('type', ROLE_TYPE_PERMISSION);
					dashboardsPermissions.addQuery('read', false);
					dashboardsPermissions.addQuery('write',  true);
					dashboardsPermissions.query();
					while(dashboardsPermissions.next()) {
						answer = gs.hasRole(dashboardsPermissions.getValue('identity'));
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
