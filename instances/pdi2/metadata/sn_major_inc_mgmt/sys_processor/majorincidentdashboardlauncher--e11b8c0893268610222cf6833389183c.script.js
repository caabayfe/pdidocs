(function process(g_request, g_response, g_processor) {

    if (gs.getProperty("com.glide.par.unified_analytics.enabled", "true") === "true") {
        g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/ed6beb7877d2311017dea86eaf5a99fa");
        return;
    }

    var dashboardGr = new GlideRecord('pa_dashboards');
    var dashboardId = 'f571f21549c1c300964f6197c058a479';
    if (dashboardGr.get(dashboardId)) {
        g_response.sendRedirect("$pa_dashboard.do?sysparm_dashboard=" + dashboardId + "&amp;sysparm_tab=fc22b70249010700964f6197c058a430&amp;sysparm_cancelable=true&amp;sysparm_editable=false&amp;sysparm_active_panel=false&amp;sysparm_ignore_default_filter=false");
        return;
    }

    g_response.sendRedirect("/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/ed6beb7877d2311017dea86eaf5a99fa");

})(g_request, g_response, g_processor);
