updateColumnType("sys_gen_ai_filter_sample", "sample_text");

function updateColumnType(name, element) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", name);
    gr.addQuery("internal_type", "string");
    gr.addQuery("element", element);
    gr.setWorkflow(false);
    gr.query();
    if (gr.next()) {
        gr.setValue("internal_type", "translated_text");
        gr.update();
    }
}
