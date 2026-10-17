(function executeRule(current, previous /*null when async*/) {
	// delete all dashboard stats
	var dashboardStats = new SNC.DashboardStats();
	dashboardStats.deleteStats(current.getUniqueValue());

})(current, previous);
