(function executeRule(current, previous /*null when async*/ ) {
	// find dashboard
	var dashboardGrid = new GlideRecord('sys_grid_canvas');
	dashboardGrid.addQuery('sys_id', current.grid_canvas);
	dashboardGrid.query();
	if (!dashboardGrid.next())
		return;
	var dashboardTabs = new GlideRecord('pa_tabs');
	dashboardTabs.addQuery('canvas_page', dashboardGrid.sys_id);
	dashboardTabs.query();
	if (!dashboardTabs.next())
		return;

	var dashboardm2mTabs = new GlideRecord('pa_m2m_dashboard_tabs');
	dashboardm2mTabs.addQuery('tab',dashboardTabs.sys_id);
	dashboardm2mTabs.query();
	if (!dashboardm2mTabs.next())
		return;
	const dashboardSysId = dashboardm2mTabs.dashboard;

    // Insert or update the core ui dashboard metadata
    var dashboardMetadata = new GlideRecord('analytics_dashboard_metadata');
    dashboardMetadata.addQuery('dashboard', dashboardSysId);
    dashboardMetadata.query();
    if (dashboardMetadata.next()) {
        var analyticsCenterUtil = new global.AnalyticsCenterUtil();

        if (current.operation() == 'delete') {
            // delete operation does not update updated_by and updated_on fields
            dashboardMetadata.last_updated_by = gs.getUserID();
            dashboardMetadata.last_updated_on = gs.nowDateTime();
        } else {
            dashboardMetadata.last_updated_by = analyticsCenterUtil.getUserSysId(current.sys_updated_by);
            dashboardMetadata.last_updated_on = current.sys_updated_on;
        }
        dashboardMetadata.update();
    }
    dashboardMetadata.close();
})(current, previous);
