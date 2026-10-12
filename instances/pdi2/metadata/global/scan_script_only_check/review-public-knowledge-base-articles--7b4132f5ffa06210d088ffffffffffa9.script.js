(function(finding) {
    var userGr = new GlideRecord("sys_user");
    userGr.addQuery("user_name", "guest");
    userGr.query();
    var userId = userGr.next() ? userGr.sys_id + "" : "guest";

    var gr = new GlideRecord('kb_knowledge');
    gr.query();
    while (gr.next()) {
        var kbDiag = new KBDiagnostics(true, userId, gr.sys_id);
        var summary = kbDiag.getDiagnostics().summary;
        if (summary == kbDiag.OVERRIDE_ACCESS || summary == kbDiag.READ_ACCESS || summary == kbDiag.CONTRIBUTE_ACCESS) {
            finding.setCurrentSource(gr);
            finding.setValue('finding_details', 'The Knowledge Base Article "' + gr.getValue('short_description') + '" is available to unauthenticated users.' +
                ' If this Knowledge Base Article should not be available publicly, the User Criteria configuration can' +
                ' be updated at the Knowledge Base or Article level. If this Knowledge Base Article should be public, this check' +
                ' can be muted.'
            )
            finding.increment();
        }
    }

})(finding);
