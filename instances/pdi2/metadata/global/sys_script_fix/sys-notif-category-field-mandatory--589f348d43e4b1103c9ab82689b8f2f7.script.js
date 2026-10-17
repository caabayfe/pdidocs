var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_notification");
gr.addQuery("element", "category");
gr.setWorkflow(false);
gr.query();
if (gr.next()) {
    gr.setValue("mandatory", true);
    gr.update();
}
