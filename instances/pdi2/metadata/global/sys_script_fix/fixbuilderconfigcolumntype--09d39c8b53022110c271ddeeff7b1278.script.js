var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_one_extend_builder_config");
gr.addQuery("element", "name");
gr.query();
if (gr.next()) {
    gr.setValue("internal_type", "string");
	gr.setValue("attributes", "");
    gr.update();
}
