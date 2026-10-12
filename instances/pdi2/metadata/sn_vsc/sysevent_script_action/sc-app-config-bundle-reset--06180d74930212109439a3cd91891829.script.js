var gr = new GlideRecord("sn_ace_app_config");
gr.addEncodedQuery("sys_scope=a51d46e3f2014110366b10017c5ba675");
gr.query();
while (gr.next()) {
    if (!gs.nil(gr.bundle)) {
        gr.bundle = "";
        gr.setWorkflow(false);
        gr.update();
    }
}
