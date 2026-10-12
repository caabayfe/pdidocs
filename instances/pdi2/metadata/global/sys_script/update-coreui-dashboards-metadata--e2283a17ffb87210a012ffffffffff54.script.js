(function executeRule(current, previous /*null when async*/ ) {
    // Insert or update the core ui dashboard metadata
    var dashboardMetadata = new GlideRecord('analytics_dashboard_metadata');
    dashboardMetadata.addQuery('dashboard', current.dashboard);
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
