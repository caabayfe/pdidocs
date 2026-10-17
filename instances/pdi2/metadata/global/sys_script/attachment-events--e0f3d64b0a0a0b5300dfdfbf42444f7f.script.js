var att = new Attachment();
att.setRecord(current);
if (att.isIndexed()) {
   var key = current.table_name + '-' + current.table_sys_id + '-' + current.sys_id;
   gs.eventQueue("text_index.attachment", null, current.operation(), key, "text_index");
}
