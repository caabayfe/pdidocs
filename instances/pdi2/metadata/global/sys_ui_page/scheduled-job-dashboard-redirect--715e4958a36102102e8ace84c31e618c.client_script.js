var ga = new GlideAjax('JobsDashboardVersionResolver');
ga.addParam('sysparm_name', 'getVersion');

ga.getXMLAnswer(redirect);

// callback function for returning the result from the script include
function redirect(response) {
    if (response == "1")
        g_navigation.open("sn_async_dashboard_redirect.do");
    else
        g_navigation.open("sn_async_dashboard_redirect_to_scheduled_jobs.do");
}
