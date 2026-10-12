var tableName = '';
var owner = '';
var gr = new GlideRecord('sys_attachment_migration_tracker');
gr.addQuery('active', true);
gr.query();
if (gr.next()) {
    tableName = gr.getValue('table_name');
    owner = gr.getValue('owner');
    var attachmentMigrationUtil = new AttachmentMigrationUtil();
    attachmentMigrationUtil.enqueueAttachmentBatch(tableName, owner);
}
