(function executeRule(current, previous /*null when async*/) {

	// Widgets live on pages → pages appear in tabs → tabs belong to dashboards

	var pageId = current.page;          // same value for insert / update / delete
	if (!pageId) return;

	// Find tabs that reference this page
	var dashIds = [];
	var tabGR = new GlideRecord('pa_tabs');
	tabGR.addQuery('page', pageId);
	tabGR.queryNoDomain();
	while (tabGR.next()) {
		var m2m = new GlideRecord('pa_m2m_dashboard_tabs');
		m2m.addQuery('tab', tabGR.sys_id);
		m2m.queryNoDomain();
		while (m2m.next()) {
			var d = m2m.dashboard + '';
			if (dashIds.indexOf(d) === -1)
				dashIds.push(d);
		}
	}

	var migrator = new PopulateReadyToMigrate();
	migrator.populateSelectedDashboardsReadyToMigrateColumns(dashIds);

})(current, previous);
