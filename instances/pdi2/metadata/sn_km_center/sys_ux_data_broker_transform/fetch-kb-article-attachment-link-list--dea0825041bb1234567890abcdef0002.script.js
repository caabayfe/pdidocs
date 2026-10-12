function transform(input) {
    var table = input.table || 'kb_knowledge';
    // resolvedSysId is set by client script 0015 on DELETE_SUCCEEDED so the
    // refresh works even when sysId prop is still a temp placeholder (-1_uid_*).
    var sys_id = input.resolvedSysId || input.sys_id;

    // Guard against missing or temp-placeholder sys_id (new unsaved articles).
    if (!sys_id || sys_id.charAt(0) === '-') {
        return { linkList: [] };
    }

    var grs = new GlideRecordSecure('sys_attachment');
    grs.addQuery('table_name', table);
    grs.addQuery('table_sys_id', sys_id);
    grs.orderBy('file_name');
    grs.setLimit(100); // intentional cap — articles with >100 attachments will be truncated
    grs.query();

    var linkList = [];
    while (grs.next()) {
        linkList.push({
            title: grs.getValue('file_name'),
            value: 'sys_attachment.do?sys_id=' + grs.getValue('sys_id')
        });
    }

    return { linkList: linkList };
}
