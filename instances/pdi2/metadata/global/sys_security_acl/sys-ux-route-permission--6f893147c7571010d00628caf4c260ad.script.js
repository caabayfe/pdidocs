var gr = new GlideRecord("sys_ux_app_route");
gr.get(current.route);
answer = gr.isValidRecord() && gr.canDelete();
