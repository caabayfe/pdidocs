(function process(g_request, g_response, g_processor) {

    if (gs.getProperty("com.glide.par.unified_analytics.enabled", "true") === "true") {
        g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/1e4e9cc4c31e3110458f1fec5440dd66");
        return;
    }

    var dashboardGr = new GlideRecord('pa_dashboards');
    var dashboardId = '18b1f472533130104c90ddeeff7b12a6';
    if (dashboardGr.get(dashboardId)) {
        g_response.sendRedirect("$pa_dashboard.do?sysparm_dashboard=" + dashboardId);
        return;
    }

    g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/1e4e9cc4c31e3110458f1fec5440dd66");

})(g_request, g_response, g_processor);
