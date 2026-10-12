(function process(g_request, g_response, g_processor) {

    if (gs.getProperty("com.glide.par.unified_analytics.enabled", "true") === "true") {
        g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/40ddd047431231107f9fbbfd6bb8f29b");
        return;
    }
	
    var dashboardGr = new GlideRecord('pa_dashboards');
    var dashboardId = '05b0a8b7c3123010a282a539e540dd69';
    if (dashboardGr.get(dashboardId)) {
        g_response.sendRedirect("$pa_dashboard.do?sysparm_dashboard=" + dashboardId);
        return;
    }

    g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/40ddd047431231107f9fbbfd6bb8f29b");

})(g_request, g_response, g_processor);
