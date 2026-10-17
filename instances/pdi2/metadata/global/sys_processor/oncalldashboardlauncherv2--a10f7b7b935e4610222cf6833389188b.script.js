(function process(g_request, g_response, g_processor) {


    if (gs.getProperty("com.glide.par.unified_analytics.enabled", "true") === "true") {
        g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/f301b972532a7110752addeeff7b12c3");
        return;
    }

    var dashboardGr = new GlideRecord('pa_dashboards');
    var dashboardId1 = 'af9f6e7d53af00100c54ddeeff7b127f';
    var dashboardId2 = '292ad76653e700100c54ddeeff7b12a0';
    if (dashboardGr.get(dashboardId1) || dashboardGr.get(dashboardId2)) {
        var csrf_protect = g_request.getParameter('sysparm_ck');
        g_response.sendRedirect("on_call_dashboard_launcher.do?sysparm_ck=" + csrf_protect);
        return;
    }

    g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/f301b972532a7110752addeeff7b12c3");

})(g_request, g_response, g_processor);
