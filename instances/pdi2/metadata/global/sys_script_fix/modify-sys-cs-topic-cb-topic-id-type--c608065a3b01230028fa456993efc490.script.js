updateColumnType();
function updateColumnType() {
    var gr = new GlideRecord("sys_dictionary");
    gr.addQuery("name", "sys_cs_topic");
    gr.addQuery("internal_type", "string");
    gr.addQuery("element", "cb_topic_id");
    gr.setWorkflow(false);
    gr.query();

    if(gr.next()) {
        gr.setValue("internal_type", "reference");
        gr.update();
    }
}
