var sg = gs.action.getGlideURI();
var documentVersionId = sg.get('sys_id');
if (documentVersionId) {
    var a = new global.DocumentObjectSecurity();
    answer = a.canReadDocumentVersionId(documentVersionId);
} else {
    // no document versionId so new document creation - show page 
    if (gs.hasRole('platform_document_management_delete') || gs.hasRole('platform_document_management_writer') || gs.hasRole('platform_document_management_admin') || gs.hasRole('snc_external')) {
        answer = true;
    } else {
        answer = false;
    }
}
