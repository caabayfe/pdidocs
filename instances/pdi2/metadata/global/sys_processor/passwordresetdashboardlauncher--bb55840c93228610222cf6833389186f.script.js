(function process(g_request, g_response, g_processor) {

    if (gs.getProperty("com.glide.par.unified_analytics.enabled", "true") === "true") {
        g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/8b4022c293d48210ef1f849c548918cc");
        return;
    }

    var dashboardGr = new GlideRecord('pa_dashboards');
    var dashboardId = '39d156755302301026b0ddeeff7b1282';
    if (dashboardGr.get(dashboardId)) {
        g_response.sendRedirect("$pa_dashboard.do?sysparm_dashboard=" + dashboardId);
        return;
    }

    g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/8b4022c293d48210ef1f849c548918cc");

})(g_request, g_response, g_processor);
