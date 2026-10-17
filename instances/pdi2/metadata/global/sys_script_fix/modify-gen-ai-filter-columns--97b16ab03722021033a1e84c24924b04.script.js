updateColumnType("sys_gen_ai_filter", "filter_name");
updateColumnType("sys_gen_ai_filter_group", "filter_group_name");
setMandatoryColumn("sys_gen_ai_filter_config", "document_table");

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

function setMandatoryColumn(name, element) {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", name);
    gr.addQuery("element", element);
    gr.setWorkflow(false);
    gr.query();
    if (gr.next()) {
        gr.setValue("mandatory", true);
        gr.update();
    }
}
