(function process(g_request, g_response, g_processor) {

    if (gs.getProperty("com.glide.par.unified_analytics.enabled", "true") === "true") {
        g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/9d489143c3923110458f1fec5440dda1");
        return;
    }

    var dashboardGr = new GlideRecord('pa_dashboards');
    var dashboardId = '287d07d1ff3130106c1ef9a7cddcbd5d';
    if (dashboardGr.get(dashboardId)) {
        g_response.sendRedirect("$pa_dashboard.do?sysparm_dashboard=" + dashboardId);
        return;
    }

    g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/9d489143c3923110458f1fec5440dda1");

})(g_request, g_response, g_processor);
