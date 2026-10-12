answer = getAttachmentWriteAnswer();

function getAttachmentWriteAnswer() {
   if (current.table_name.nil())
      return true;
   
   // If the attachment is from live feed,
   // allow it to be attached.
   if (current.table_name == 'live_profile')
      return current.table_sys_id == new GlideappLiveProfile().getID();

   // Remove prefix
   var tableName = current.table_name;
   var invisible_prefix = "invisible.";
   if (tableName.startsWith("invisible."))
      tableName = tableName.substring(10);
   else if (tableName.startsWith("ZZ_YY"))
    tableName = tableName.substring(5);
    var parentRecord = new GlideRecord(tableName);
    if (!parentRecord.isValid())
        return true;

    parentRecord.setWorkflow(false);
    if (!parentRecord.get(current.table_sys_id))
        return false; // If we get here, then access is being blocked by a before query BR

   // outgoing emails created by Email Client
   if (current.table_name == "sys_email" && parentRecord.weight == -1 && parentRecord.type == "send-ignored")
      return true;

   return parentRecord.canWrite();
}
