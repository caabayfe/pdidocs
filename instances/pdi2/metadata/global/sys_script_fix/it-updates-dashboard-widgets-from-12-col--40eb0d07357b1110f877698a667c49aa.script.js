gs.info('par_dashboards Update widgets to 48 columns. Start');

var dashboardLayoutUtil = new SNC.DashboardLayoutUtilScriptable();
var dashboardsMigrated = dashboardLayoutUtil.migrateAllDashboardsTo48Column();
gs.info('dashboards Migrated to 48 columns = [' + dashboardsMigrated + ']');
gs.info('par_dashboards Update widgets to 48 columns. End');
