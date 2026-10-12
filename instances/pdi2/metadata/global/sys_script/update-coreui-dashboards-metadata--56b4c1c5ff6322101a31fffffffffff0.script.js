(function executeRule(current, previous /*null when async*/ ) {

    // Insert or update the core ui dashboard metadata
    var dashboardMetadata = new GlideRecord('analytics_dashboard_metadata');
    dashboardMetadata.addQuery('dashboard', current.sys_id);
    dashboardMetadata.query();
    if (dashboardMetadata.next()) {
        // we only care about dashboard name and owner change
        if (current.name != previous.name || current.owner != previous.owner) {
            updateDetails(current, dashboardMetadata);
            dashboardMetadata.update();
        }
    } else {
        dashboardMetadata.initialize();
        updateDetails(current, dashboardMetadata);
        dashboardMetadata.insert();
    }

    dashboardMetadata.close();

})(current, previous);

function updateDetails(current, dashboardMetadata) {
    var analyticsCenterUtil = new global.AnalyticsCenterUtil();
    dashboardMetadata.dashboard = current.sys_id;
    dashboardMetadata.created_by = analyticsCenterUtil.getUserSysId(current.sys_created_by);
    dashboardMetadata.created_on = current.sys_created_on;
    dashboardMetadata.last_updated_by = analyticsCenterUtil.getUserSysId(current.sys_updated_by);
    dashboardMetadata.last_updated_on = current.sys_updated_on;
    dashboardMetadata.last_deactivated_on = '';
}
