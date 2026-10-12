if (gs.hasRole('dashboard_admin') || gs.hasRole('platform_analytics_admin')) {
    answer = true;
} else {
    var dashboardSysId = current.dashboard;
    var gr = new GlideRecord('analytics_dashboard');
    if (dashboardSysId) {
        gr.get(dashboardSysId);
    }
	
    answer = gr.canRead();
}
