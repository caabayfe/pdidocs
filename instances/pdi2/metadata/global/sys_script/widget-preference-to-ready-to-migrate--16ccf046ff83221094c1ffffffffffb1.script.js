(function executeRule(current, previous /*null when async*/) {

	// Only care about renderer / type prefs
	var prefName = current.name;
	if (!prefName || ['renderer', 'type'].indexOf(prefName) === -1)
		return;

	var widgetId = current.portal_section;
	if (!widgetId) return;

	var dashIds = [];
	var widgetGR = new GlideRecord('sys_portal');
	if (!widgetGR.get(widgetId)) return;

	var tabGR = new GlideRecord('pa_tabs');
	tabGR.addQuery('page', widgetGR.page);
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
