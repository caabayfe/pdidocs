function onClick(g_form) {
    g_form.getReference('default_version',canDownload);
}
	
function canDownload(versionRecord){
    var versionSysId = versionRecord.getValue('sys_id');
	var isURL = (versionRecord.getValue('type') === 'url');
	if (versionSysId == '' || isURL)
        g_form.addErrorMessage(getMessage("Downloading the documents has failed because either the document has no versions or the default version has URL as the file type."));
    else {
        var attachment = new GlideRecord('sys_attachment');
        attachment.addQuery('table_sys_id', versionSysId);
        attachment.query(downloadDocument);
    }
}

function downloadDocument(record) {
    while (record.next()) {
        var id = record.getValue('sys_id');
        openUrl('/sys_attachment.do?sys_id=' + id);
    }
}

function openUrl(url) {
    this.open(url, '_blank');
}
