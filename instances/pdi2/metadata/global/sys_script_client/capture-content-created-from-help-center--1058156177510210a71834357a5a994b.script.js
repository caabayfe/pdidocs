function onSubmit() {

    if (g_form.getValue('type') != 'embedded_help')
        return;
    var url = new URL(decodeURIComponent(top.location.href));
    var addHelpLinkClicked = new URLSearchParams(url.search).get('add_help_link_clicked');
    var payload = {
        context: g_form.getValue('context'),
        application_route: g_form.getValue('app_route'),
        sys_scope: g_form.getValue('sys_scope'),
        status: g_form.getValue('status')
    };

    if (addHelpLinkClicked === "true") {
        var ga = new GlideAjax('SNHelpAnalyticsController');
        ga.addParam('sysparm_name', 'logDatafromClient');
        ga.addParam('sysparm_event', 'new_record_using_link'); // instrumentation event
        ga.addParam('sysparm_point', 'help_centre'); // instrumentation point
        ga.addParam('sysparm_category', 'adoption_services')
        ga.addParam('sysparm_data', JSON.stringify(payload));
        ga.getXML();
    }

}
