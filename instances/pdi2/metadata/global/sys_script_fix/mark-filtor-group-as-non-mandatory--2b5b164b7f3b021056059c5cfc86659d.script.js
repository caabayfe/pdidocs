var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_gen_ai_filter");
gr.addQuery("element", "filter_group");
gr.setWorkflow(false);
gr.query();
if (gr.next()) {
    gr.setValue("mandatory", false);
    gr.update();
}
