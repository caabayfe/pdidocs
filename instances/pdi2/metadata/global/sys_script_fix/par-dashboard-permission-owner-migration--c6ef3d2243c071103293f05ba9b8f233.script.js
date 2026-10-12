gs.info('par_dashboard_permission owner migration - Update or insert owner user to par_dashboard_permission. Start');
migrateDashboardOwnerData();
gs.info('par_dashboard_permission owner migration - Update or insert owner user to par_dashboard_permission. End');

function migrateDashboardOwnerData(){
	if (pm.isZboot())
		return;

	var gr = new GlideRecord("par_dashboard_user_metadata");
	gr.query();
	while (gr.next()) {
		var ownerUserId = gr.created_by_user;
		var dashboardId = gr.dashboard;
		gs.info('Migrating par_dashboard_permission for dashboard with id'+dashboardId);
		
		updateDashboardPermissionForOwnerUser(dashboardId, ownerUserId);
	}

	gs.info('par_dashboard_permission migrateDashboardOwnerData. End');
}

function updateDashboardPermissionForOwnerUser(dashboardId, ownerUserId){
	var grDashboardPermission = new GlideRecord("par_dashboard_permission");
	grDashboardPermission.addQuery("dashboard",dashboardId);
	grDashboardPermission.addQuery("user",ownerUserId);
	grDashboardPermission.query();
	if (grDashboardPermission.next()) {
		grDashboardPermission.setValue("owner", true);
		if (grDashboardPermission.update())
			return;
		gs.log("par_dashboard_permission - failed to update owner field. Will try to insert new record");
		
	} 
	// we dont have any permission for owner user or could not update current record lets insert new one
	grDashboardPermission = new GlideRecord("par_dashboard_permission");
	grDashboardPermission.initialize();
	grDashboardPermission.setValue("dashboard",dashboardId);
	grDashboardPermission.setValue("user",ownerUserId);
	grDashboardPermission.setValue("owner", true);
	if (!grDashboardPermission.insert())
		gs.log("par_dashboard_permission - failed to insert new record to par_dashboard_permission table for dashboard with id"+dashboardId+" and user with id"+ownerUserId);

}
