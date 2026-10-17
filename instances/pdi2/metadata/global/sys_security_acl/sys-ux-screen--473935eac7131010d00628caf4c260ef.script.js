var gr = new GlideRecord("sys_ux_screen_type");
gr.get(current.screen_type);
answer = gr.isValidRecord() && gr.canRead();
