function onClick(g_form) {
    var ga = new GlideAjax('DocumentAnalyticsAPI');
    ga.addParam('sysparm_name', 'sendDataFromClient');
    ga.addParam('sysparm_document_creation_source', 'Workspace');
    ga.getXMLAnswer();
    g_form.submit(g_form.getActionName());
}
