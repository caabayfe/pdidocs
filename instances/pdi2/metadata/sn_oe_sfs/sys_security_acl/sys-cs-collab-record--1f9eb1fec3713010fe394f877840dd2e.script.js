//if user can read the document (task/interaction), the user should be able to read the sys_cs_collab_record. Needed to be able to open the chat in read only mode
var gr = new GlideRecord(current.table);
answer = gr.get(current.document) && gr.canRead();
