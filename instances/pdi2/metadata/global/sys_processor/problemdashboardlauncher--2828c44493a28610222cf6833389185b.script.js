(function process(g_request, g_response, g_processor) {

    if (gs.getProperty("com.glide.par.unified_analytics.enabled", "true") === "true") {
        g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/d9c1087a532231104bdeddeeff7b127a");
        return;
    }

    var dashboardGr = new GlideRecord('pa_dashboards');
    var dashboardId = '3d48f669538223008329ddeeff7b1253';
    if (dashboardGr.get(dashboardId)) {
        g_response.sendRedirect("$pa_dashboard.do?sysparm_dashboard=" + dashboardId + "&amp;amp;sysparm_tab=c8687e69538223008329ddeeff7b122d&amp;amp;sysparm_cancelable=true&amp;amp;sysparm_editable=undefined&amp;amp;sysparm_active_panel=false&amp;amp;sysparm_ignore_default_filter=false");
        return;
    }

    g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/d9c1087a532231104bdeddeeff7b127a");

})(g_request, g_response, g_processor);
