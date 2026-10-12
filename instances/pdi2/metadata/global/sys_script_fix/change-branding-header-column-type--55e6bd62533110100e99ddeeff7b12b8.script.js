updateColumnType("header_label");

function updateColumnType(element) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_cs_branding_setup");
    gr.addQuery("internal_type", "string");
    gr.addQuery("element", element);
    gr.setWorkflow(false);
    gr.query();
    if (gr.next()) {
        gr.setValue("internal_type", "translated_field");
        gr.update();
    }
}
