var sg = gs.action.getGlideURI();
var fp = sg.getFileFromPath();
var a = new global.DocumentObjectSecurity();
if (fp == 'ds_document') {
    var documentId = sg.get('sys_id');
    answer = a.canWriteDocumentId(documentId);
} else if (fp == 'ds_document_reviewer') {
    var documentReviewerId = sg.get('sys_id');
    answer = a.canWriteDocumentReviewerId(documentReviewerId);
} else if (fp == 'ds_document_reviewer_list' || fp == 'AJAXJellyRunner' || fp.includes('api/now')) {
    answer = a.canWriteDocumentReviewerId(current.sysId);
} else {
    answer = false;
}
