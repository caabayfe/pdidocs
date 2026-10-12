var sg = gs.action.getGlideURI();
var fp = sg.getFileFromPath();
var a = new global.DocumentObjectSecurity();
if (fp) {
    if (fp == 'ds_document') {
        var documentId = sg.get('sys_id');
        answer = a.canCreateDocumentId(documentId) || a.canWriteDocumentId(documentId);
    } else if (fp == 'ds_document_version' || fp.includes('api/now/sp')) {
        var documentVersionId = sg.get('sys_id');
        answer = a.canCreateDocumentVersionId(documentVersionId);
    } else {
        var b = new GlideRecordSecure('ds_document');
        answer = b.canCreate();
    }
} else {
    var documentGr = new GlideRecordSecure('ds_document');
    answer = documentGr.canCreate();
}
