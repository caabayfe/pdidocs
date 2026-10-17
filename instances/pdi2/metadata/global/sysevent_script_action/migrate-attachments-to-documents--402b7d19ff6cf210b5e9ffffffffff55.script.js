var batchInfo = JSON.parse(event.parm1);
var attachments = batchInfo.attachments;
var owner = batchInfo.owner;
var migrationSysId = batchInfo.migration_sys_id;

for (var i = 0; i < attachments.length; i++) {
    var attachmentId = attachments[i].sys_id;
    var attachmentName = attachments[i].file_name;
    var tableName = attachments[i].table_name;
    var targetRecordSysId = attachments[i].target_record_sys_id;
    var statusGR = new GlideRecord('sys_attachment_migration_status');
    try {
        var attachGR = new GlideRecord('sys_attachment');
        if (!attachGR.get(attachmentId))
            throw 'Attachment not found';
        statusGR.addQuery('attachment', attachmentId);
        statusGR.query();
        if (statusGR.hasNext())
            updateStatusRecord(statusGR, 'in_progress', '');
        else
            createStatusRecord(migrationSysId, attachmentId, tableName, targetRecordSysId, 'in_progress', 0, '');
        var dom = new DocumentObjectManager();
        var doc = {
            file_name: attachmentName,
            owner: owner.toString()
        };
        var result = dom.createAndLinkDocument(doc, tableName, targetRecordSysId);
        attachGR.table_name = 'ds_document_version';
        attachGR.table_sys_id = result.version;
        attachGR.update();
        statusGR = new GlideRecord('sys_attachment_migration_status');
        statusGR.addQuery('attachment', attachmentId);
        statusGR.query();
        if (statusGR.hasNext())
            updateStatusRecord(statusGR, 'successful', '');
    } catch (e) {
        handleError(result, migrationSysId, attachmentId, tableName, targetRecordSysId, e);
    }
}

function updateStatusRecord(statusGR, status, message) {
    statusGR.next();
    statusGR.setValue('status', status);
    statusGR.setValue('message', message + '');
    if (status !== 'successful')
        statusGR.setValue('retry_count', statusGR.retry_count + 1);
    statusGR.update();
}

function createStatusRecord(migrationSysId, attachmentId, tableName, targetRecordSysId, status, retryCount, message) {
    var statusGR = new GlideRecord('sys_attachment_migration_status');
    statusGR.initialize();
    statusGR.setValue('migration_sys_id', migrationSysId);
    statusGR.setValue('attachment', attachmentId);
    statusGR.setValue('table_name', tableName);
    statusGR.setValue('target_record', targetRecordSysId);
    statusGR.setValue('status', status);
    statusGR.setValue('retry_count', retryCount);
    statusGR.setValue('message', message + '');
    statusGR.insert();
}

function handleError(result, migrationSysId, attachmentId, tableName, targetRecordSysId, error) {
    var statusGR = new GlideRecord('sys_attachment_migration_status');
    statusGR.addQuery('attachment', attachmentId);
    statusGR.query();
    if (statusGR.hasNext())
        updateStatusRecord(statusGR, 'failed', error);
    else
        createStatusRecord(migrationSysId, attachmentId, tableName, targetRecordSysId, 'failed', 0, error);
    // Rollback
    var docSysId = result.document_sys_id;
    if (docSysId) {
        var docGR = new GlideRecord('ds_document');
        docGR.get(docSysId);
        docGR.deleteRecord();
    }
}
