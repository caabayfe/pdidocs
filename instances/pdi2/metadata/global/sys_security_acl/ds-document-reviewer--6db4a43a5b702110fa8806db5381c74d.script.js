var sg = gs.action.getGlideURI();
var fp = sg.getFileFromPath();
var a = new global.DocumentObjectSecurity();
if (fp == 'ds_document') {
    var documentId = sg.get('sys_id');
    answer = a.canCreateDocumentId(documentId) || a.canWriteDocumentId(documentId);
} else if (fp == 'ds_document_reviewer' || fp.includes('api/now/sp')) {
    var documentReviewerId = sg.get('sys_id');
    answer = a.canCreateDocumentReviewerId(documentReviewerId);
} else {
    var b = new GlideRecordSecure('ds_document');
    answer = b.canCreate();
}
