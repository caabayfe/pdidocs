var grAttachment = new GlideRecord("sys_attachment");
grAttachment.addQuery("table_name", "ml_update_set");
grAttachment.query();

while (grAttachment.next()) {
    var grUpdateSet = new GlideRecord("ml_update_set");
    grUpdateSet.addQuery("sys_id", grAttachment.table_sys_id);
    grUpdateSet.query();
    if (!grUpdateSet.next()) {
        gs.info("Deleting Attachment with File name: " + grAttachment.file_name + " for Table sys ID: " + grAttachment.table_sys_id);
        grAttachment.deleteRecord();
    }
}
