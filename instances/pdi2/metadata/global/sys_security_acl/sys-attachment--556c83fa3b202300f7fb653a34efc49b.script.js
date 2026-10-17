if (GlideDBObjectManager.getAbsoluteBase(current.table_name) == 'kb_knowledge' || current.table_name  == 'kb_feedback') 
    answer = new global.AttachmentSecurity().canRead(current);
else
    answer = false;
