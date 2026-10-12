function openAnalyticsWindow() {
    if (!isOperationsDefined()) {
        alert('Specify a resource to view analytics for this API');
        return;
    }
    var url = new GlideURL('now/platform-analytics-workspace/dashboards/params/edit/false/tab-sys-id/08c63f6027d04210b1de55225cf6f2f1/sys-id/b8b437ec27904210b1de55225cf6f2aa');

    var w = getTopWindow();
    var newWindow = w.open(url.getURL(), "_blank");
    newWindow.focus();
}

function isOperationsDefined() {
    var gr = new GlideRecord('sys_ws_operation');
    gr.addQuery('web_service_definition', g_form.getUniqueValue());
    gr.query();
    return gr.hasNext();
}
