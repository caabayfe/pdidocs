function transform(input) {
    var response = {};
    var dashboards = input.dashboardId;
    for (var i = 0; i < input.dashboardId.length; i++) {
        response[dashboards[i]] = false;
        if (dashboards[i] == 'benchmarks')
            response[dashboards[i]] = new GlidePluginManager().isActive('sn_benchmarks');
        var grObj = new GlideRecord('sys_db_object');
        if (dashboards[i] == 'success-dashboard' && gs.getUser().hasRole("sn_sd.success_dashboard_admin")) {
            if (grObj.get('name', 'sn_sd_service_group')) {
                var grServiceGroup = new GlideAggregate('sn_sd_service_group');
                grServiceGroup.addAggregate("COUNT");
                grServiceGroup.query();
                grServiceGroup.next();
                response[dashboards[i]] = grServiceGroup.getAggregate("COUNT") > 0;
            }
        }
        if (dashboards[i] == 'operational-success' && gs.getUser().hasRole("sn_sd.success_dashboard_admin")) {
            if (grObj.get('name', 'sn_sd_kpi_category')) {
                var grKpiCategory = new GlideAggregate('sn_sd_kpi_category');
                grKpiCategory.addAggregate("COUNT");
                grKpiCategory.addQuery('dashboard_type', 'operational_success');
                grKpiCategory.query();
                grKpiCategory.next();
                response[dashboards[i]] = grKpiCategory.getAggregate("COUNT") > 0;
            }
        }
    }
    return response;
}
