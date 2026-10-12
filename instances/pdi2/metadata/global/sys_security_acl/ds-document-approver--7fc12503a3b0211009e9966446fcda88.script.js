var sg = gs.action.getGlideURI();
var fp = sg.getFileFromPath();
var a = new global.DocumentObjectSecurity();
if (fp == 'ds_document') {
    var documentId = sg.get('sys_id');
    answer = a.canWriteDocumentId(documentId);
} else if (fp == 'ds_document_approver') {
    var documentApproverId = sg.get('sys_id');
    answer = a.canWriteDocumentApproverId(documentApproverId);
} else if (fp == 'ds_document_approver_list' || fp == 'AJAXJellyRunner' || fp.includes('api/now')) {
    answer = a.canWriteDocumentApproverId(current.sysId);
} else {
    answer = false;
}
