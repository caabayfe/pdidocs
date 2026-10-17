if (current.table_name == 'ds_document_version')
    answer = canReadAttachment(current);
else
    answer = false;

function canReadAttachment(current) {
    var parentRecord = new GlideRecord(current.table_name);
    if (parentRecord.get(current.table_sys_id)) {
        return parentRecord.canRead();
    } else {
        return false;
    }
}
