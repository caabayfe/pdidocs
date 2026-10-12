var sg = gs.action.getGlideURI();
var documentId = sg.get('sys_id');
if (documentId) {
    var a = new global.DocumentObjectSecurity();
    answer = a.canReadDocumentId(documentId);
} else {
    // no documentId so new document creation - show page 
    if (gs.hasRole('platform_document_management_delete') || gs.hasRole('platform_document_management_writer') || gs.hasRole('platform_document_management_admin') || gs.hasRole('snc_external'))
        answer = true;
    else
        answer = false;
}
