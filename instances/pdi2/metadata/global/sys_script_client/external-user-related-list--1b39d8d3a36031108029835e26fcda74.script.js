function onLoad() {
 if (g_user.hasRoleExactly("snc_external", true)) {
        g_form.hideRelatedList("ds_document_reviewer.document");
        g_form.hideRelatedList("ds_document_approver.document");
    }   
}
