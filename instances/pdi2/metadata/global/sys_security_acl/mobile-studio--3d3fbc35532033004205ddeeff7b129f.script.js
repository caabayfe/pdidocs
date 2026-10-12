var gr = new GlideRecord("sys_sg_applet_launcher");
answer = gr.canCreate() && gr.canRead() && gr.canWrite();
