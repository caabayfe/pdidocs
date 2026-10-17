(function executeRule(current, previous /*null when async*/ ) {
    // Insert or update the dashboard metadata
    var dashboardMetadata = new GlideRecord('analytics_dashboard_metadata');
    dashboardMetadata.addQuery('dashboard', current.dashboard);
    dashboardMetadata.query();
    if (dashboardMetadata.next()) {
        updateDetails(current, dashboardMetadata);
        dashboardMetadata.update();
    } else {
        dashboardMetadata.initialize();
        updateDetails(current, dashboardMetadata);
        dashboardMetadata.insert();
    }

    dashboardMetadata.close();
})(current, previous);

function updateDetails(current, dashboardMetadata) {
    dashboardMetadata.dashboard = current.dashboard;
    dashboardMetadata.created_by = current.created_by_user;
    dashboardMetadata.created_on = current.created_on;
    dashboardMetadata.last_updated_by = current.updated_by_user;
    dashboardMetadata.last_updated_on = current.last_updated_on;
    dashboardMetadata.last_deactivated_on = current.last_deactivated_on;
}
