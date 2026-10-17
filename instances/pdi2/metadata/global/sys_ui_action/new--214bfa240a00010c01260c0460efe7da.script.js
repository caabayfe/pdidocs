function addAttachment(button) {
   var tableName = gel("sys_target").value;
   var sys_id = gel("sys_uniqueValue").value;
   saveAttachment(tableName, sys_id);
}
