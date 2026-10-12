if (gs.hasRole('platform_document_management_admin'))
    answer = true;
else {
    var a = new global.DocumentObjectSecurity();
    var fileType = current.getValue('file_type');
    var sourceFileSysId = current.getValue('source_sys_id');
    var redactedFileSysId = current.getValue('redacted_sys_id');

    var attGr = new GlideRecord('sys_attachment');
    if (!attGr.get(sourceFileSysId) && !attGr.get(redactedFileSysId)) {
        answer = false;
    } else if (fileType === 'document') {
        var versionSysId = attGr.getValue('table_sys_id');
        answer = a.canWriteDocumentVersionId(versionSysId);
    } else if (fileType === 'attachment') {
        var tableName = attGr.getValue('table_name');
        var recordSysId = attGr.getValue('table_sys_id');
        var parentGr = new GlideRecord(tableName);
        if (parentGr.get(recordSysId)) {
            answer = parentGr.canWrite();
        } else {
            answer = false;
        }
    } else {
        answer = false;
    }
}
