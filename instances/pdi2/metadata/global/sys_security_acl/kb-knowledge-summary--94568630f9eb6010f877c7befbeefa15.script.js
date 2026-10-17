     var gr = new GlideRecord("kb_knowledge");
     gr.addQuery("summary", current.sys_id);
     gr.addQuery("workflow_state", "published");
     gr.addActiveQuery();
     gr.query();
     gr.next();
     answer = gr.canRead();
