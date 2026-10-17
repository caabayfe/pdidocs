gs.info("[Drop par_dashboard_cache table]: Script execution started.");
var dashboardCacheGr = new GlideRecord("par_dashboard_cache");
if (dashboardCacheGr.isValid()) {
	gs.dropTable('par_dashboard_cache');
	gs.info("[PARDashboardCacheFixScript]: par_dashboard_cache table dropped successfully.");
}
else {
	gs.info("[PARDashboardCacheFixScript]: par_dashboard_cache table not found.");
}
gs.info("[Drop par_dashboard_cache table]: Script execution ended.");
