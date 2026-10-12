var sg = gs.action.getGlideURI();
var fp = sg.getFileFromPath();
var a = new global.DocumentObjectSecurity();
if (fp == 'ds_document_version_list') {
    var documentVersionId = sg.get('sys_id');
    var target = sg.getMap().get('sysparm_target');
    if (target == 'ds_document.default_version')
        answer = a.canReadDocumentVersionId(documentVersionId);
    else {
		answer = true;
	}
} else {
    answer = true;
}
