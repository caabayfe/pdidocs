(function executeRule(current, previous /*null when async*/ ) {
    // This BR only tracks update of tab name
    var dashboardm2mTabs = new GlideRecord('pa_m2m_dashboard_tabs');
    dashboardm2mTabs.addQuery('tab', current.sys_id);
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
        // we only track tab name
        if (current.name != previous.name) {
            dashboardMetadata.last_updated_by = analyticsCenterUtil.getUserSysId(current.sys_updated_by);
            dashboardMetadata.last_updated_on = current.sys_updated_on;
            dashboardMetadata.update();
        }
    }
    dashboardMetadata.close();
})(current, previous);
