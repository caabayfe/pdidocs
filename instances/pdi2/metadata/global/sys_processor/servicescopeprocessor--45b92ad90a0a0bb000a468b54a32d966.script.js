var SecurityUtil = new GlideSecurityUtils();
renderPopup();

function renderPopup() {
    var sys_id = SNC.GlideHTMLSanitizer.sanitize(g_request.getParameter("sysparm_sys_id"), null);
    if (!sys_id)
        return;

    var gr = new GlideRecord('service_scope');
    gr.get(sys_id);

    var answer = gr.description + '';
    if (answer == '')
        answer = gr.name + '';

    g_processor.writeOutput("text/html", SNC.GlideHTMLSanitizer.sanitize(answer));
}
