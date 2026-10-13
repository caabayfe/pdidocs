function showDeviceTimeline() {
    var gr = new GlideRecord("discovery_device_history");
    if (!gr.get(g_form.getUniqueValue()))
        return;

    var url = new GlideURL('show_schedule_page.do');
    url.addParam('sysparm_page_schedule_type', 'discovery_probe_sensor');

    // Add only the client options to prevent another AJAX call
    url.addParam('sysparm_timeline_agent_correlator', gr.status);
    url.addParam('sysparm_timeline_source', gr.source);

    var w = getTopWindow();
    var newWindow = w.open(url.getURL(), "_blank");
    newWindow.focus();


}
