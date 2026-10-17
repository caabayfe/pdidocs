var gr = new GlideRecord("sys_cs_collab_chat");
answer = gr.get(current.collab_chat) && gr.canRead();
