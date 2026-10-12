current.document_id = current.sysapproval;
if (!current.sysapproval.nil())
   current.source_table = current.sysapproval.sys_class_name;
