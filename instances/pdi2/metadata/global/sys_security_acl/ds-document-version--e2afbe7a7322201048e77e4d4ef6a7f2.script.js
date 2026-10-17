// var sg = gs.action.getGlideURI();
// var fp = sg.getFileFromPath();
// var a = new global.DocumentObjectSecurity();
// if (fp == 'ds_document') {
//     var documentId = sg.get('sys_id');
//     answer = a.canReadDocumentId(documentId);
// } else if (fp == 'ds_document_version') {
//     var documentVersionId = sg.get('sys_id');
//     answer = a.canReadDocumentVersionId(documentVersionId);
// } else if (fp == 'ds_document_version_list' || fp == 'AJAXJellyRunner' || fp == 'popup') {
//     answer = a.canReadDocumentVersionId(current.sysId);
// } else {
// 	answer = false;
// }
var a = new global.DocumentObjectSecurity();
answer = a.canReadDocumentId(current.document);
