(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var legacyWidgetSysId = '0805a7bf91a93efbdf0a975b38b01051';
    var res = {
        fullyMigrated: {
            filter: 0,
            widget: 0,
            report: 0,
            dashboard: 0,
        },
        partiallyMigrated: {
            dashboard: 0,
            widget: 0,
            report: 0,
            content_block: 0,
            other: 0
        }
    };

	if (request.body && request.body.data && request.body.data.contentIds && request.body.data.contentIds.length > 0) {
		var contentIds = request.body.data.contentIds;
		
		var fullAgg = new GlideAggregate('par_coreui_migration_bridge_dashboard');
		fullAgg.addQuery('pa_dashboard', 'IN', contentIds);
		fullAgg.addQuery('is_last', true);
		fullAgg.addQuery('compatibility_mode', '');
		fullAgg.addAggregate('COUNT', '');
		fullAgg.query();

		var fullyMigrated = 0;
		if (fullAgg.next()) {
			fullyMigrated = parseInt(fullAgg.getAggregate('COUNT',''));
		}

		var partialAgg = new GlideAggregate('par_coreui_migration_bridge_dashboard');
		partialAgg.addQuery('pa_dashboard', 'IN', contentIds);
		partialAgg.addQuery('is_last', true);
		partialAgg.addQuery('compatibility_mode', '!=', '');
		partialAgg.addAggregate('COUNT', '');
		partialAgg.query();

		var partialMigrated = 0;
		if (partialAgg.next()) {
			partialMigrated = parseInt(partialAgg.getAggregate('COUNT',''));
		}

		res.fullyMigrated = { dashboard: fullyMigrated };
		res.partiallyMigrated = { dashboard: partialMigrated };
		return res;
	}

    var grComponentBridge = new GlideAggregate('par_coreui_migration_bridge_component');
    grComponentBridge.groupBy('type');
    grComponentBridge.addQuery('is_last', true);
	grComponentBridge.addEncodedQuery('component!=NULL^component!=unknown');
    grComponentBridge.addAggregate('COUNT', 'component');
    grComponentBridge.query();
    while (grComponentBridge.next()) {
        res.fullyMigrated[grComponentBridge.type] = parseInt(grComponentBridge.getAggregate('COUNT', 'component'), 10);
    }
    var grDashboardBridge = new GlideAggregate('par_coreui_migration_bridge_dashboard');
    grDashboardBridge.addAggregate('COUNT(DISTINCT', 'par_dashboard.sys_id');
    grDashboardBridge.setGroup(false);
    grDashboardBridge.query();
    var dashboardTotal = 0;
    var incompatibleDashboards = 0;
    while (grDashboardBridge.next()) {
        dashboardTotal = parseInt(grDashboardBridge.getAggregate('COUNT(DISTINCT', 'par_dashboard.sys_id'), 10);
    }

    grDashboardBridge = new GlideAggregate('par_coreui_migration_bridge_widget');
    grDashboardBridge.addAggregate('COUNT(DISTINCT', 'dashboard.sys_id');
    grDashboardBridge.addQuery('dashboard_widget.component', legacyWidgetSysId);
    grDashboardBridge.setGroup(false);
    grDashboardBridge.query();
    while (grDashboardBridge.next()) {
        incompatibleDashboards = parseInt(grDashboardBridge.getAggregate('COUNT(DISTINCT', 'dashboard.sys_id'), 10);
    }
    res.dashboardTotal = dashboardTotal;
    res.incompatibleDashboards = incompatibleDashboards;
    res.partiallyMigrated.dashboard = incompatibleDashboards;
    res.fullyMigrated.dashboard = dashboardTotal - incompatibleDashboards;

    ['other', 'content_block', 'report', 'widget'].forEach(type => {
        var gr = new GlideRecord("par_coreui_migration_bridge_dashboard");
        gr.addEncodedQuery(`compatibility_modeLIKE${type}^is_last=true`)
        gr.query();
        res.partiallyMigrated[type] = gr.getRowCount();
    });
    return res;
})(request, response);
