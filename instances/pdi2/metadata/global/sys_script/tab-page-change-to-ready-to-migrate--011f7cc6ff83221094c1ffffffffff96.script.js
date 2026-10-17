(function executeRule(current, previous /*null when async*/) {

	// page just changed – fetch dashboards that include this tab
    var dashIds = [];
    var m2m = new GlideRecord('pa_m2m_dashboard_tabs');
    m2m.addQuery('tab', current.sys_id);
    m2m.queryNoDomain();
    while (m2m.next())
        dashIds.push(m2m.dashboard + '');

    var migrator = new PopulateReadyToMigrate();
	migrator.populateSelectedDashboardsReadyToMigrateColumns(dashIds);

})(current, previous);
