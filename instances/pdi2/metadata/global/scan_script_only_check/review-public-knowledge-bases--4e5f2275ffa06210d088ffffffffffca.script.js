(function(finding) {
    var userGr = new GlideRecord("sys_user");
    userGr.addQuery("user_name", "guest");
    userGr.query();
    var userId = userGr.next() ? userGr.sys_id + "" : "guest";
    var knowledgeBases = new KBDiagnostics().getDiagnosticsForUnauthenticatedUser(userId);
    if (knowledgeBases.length == 0) return;
    var gr = new GlideRecord('kb_knowledge_base');
    gr.addQuery('sys_id', 'IN', knowledgeBases);
    gr.query();
    while (gr.next()) {
        var kbaGR = new GlideRecord('kb_knowledge');
        kbaGR.addEncodedQuery('kb_knowledge_base=' + gr.sys_id);
        kbaGR.query();
        finding.setCurrentSource(gr);
        finding.setValue('finding_details', 'The Knowledge Base "' + gr.getValue('title') + '" allows for' +
            ' unauthenticated access. This knowledge base contains ' + kbaGR.getRowCount() +
            ' KB Article(s) that may be accessible to unauthenticated users.');
        finding.increment();
    }

})(finding);
