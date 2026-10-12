var PopulateExperienceDashboard = Class.create();
PopulateExperienceDashboard.prototype = {
    initialize: function() {},

    populate: function() {
        // Populate missing experience dashboard references
        var legacyDashboardGR = new GlideRecord('pa_dashboards');
        legacyDashboardGR.addNullQuery('experience_dashboard');
        legacyDashboardGR.query();

        var legacyDashboardList = [];
        while (legacyDashboardGR.next())
            legacyDashboardList.push(legacyDashboardGR.getUniqueValue());

        if (legacyDashboardList.length === 0)
            return;

        var bridgingTableGR = new GlideRecord('par_coreui_migration_bridge_dashboard');
        bridgingTableGR.addQuery('pa_dashboard', 'IN', legacyDashboardList.join());
        bridgingTableGR.addQuery('is_last', true);
        bridgingTableGR.query();

        var dashboardsMap = {};
        while (bridgingTableGR.next())
            dashboardsMap[bridgingTableGR.getValue('pa_dashboard')] = bridgingTableGR.getValue('par_dashboard');


        legacyDashboardGR = new GlideRecord('pa_dashboards');
        legacyDashboardGR.addQuery('sys_id', 'IN', legacyDashboardList.join());
        legacyDashboardGR.query();
        while (legacyDashboardGR.next()) {
        	var legacyDashboardId = legacyDashboardGR.getUniqueValue();
        	if(dashboardsMap[legacyDashboardId] && dashboardsMap[legacyDashboardId] !== 'undefined') {
          	  legacyDashboardGR.setValue('experience_dashboard', dashboardsMap[legacyDashboardId]);
              legacyDashboardGR.update();
            }
        }

    },


    type: 'PopulateExperienceDashboard'
};
